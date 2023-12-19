import { Driver } from '../../driver'
import { WSDriver } from '../ws'
import { SignalingProtocol } from './signaling_protocol'


export class RTCDriver extends Driver {
	readonly name = 'WebRTC'

	readonly _signal_protocol: SignalingProtocol
	readonly _signal_driver: Driver


	peer?: RTCPeerConnection
	reliable_channel?: RTCDataChannel
	unreliable_channel?: RTCDataChannel

	pending_candidates: RTCIceCandidateInit[] = []


	constructor() {
		super()
		this._signal_protocol = new SignalingProtocol()
		this._signal_driver = new WSDriver('$_SIGNAL_WS_ADDRESS_$')
		this._signal_driver.on_message_received = (message) => this._signal_protocol.parse_message(message)
	}


	get_status = (): string => {
		let statuses: string[] = []
		if (this.peer) {
			statuses.push(`connect:${this.peer.connectionState} signal:${this.peer.signalingState} ice:${this.peer.iceConnectionState} gather:${this.peer.iceGatheringState}`)
		}

		if (this.reliable_channel) {
			statuses.push(`reliable:${this.reliable_channel.readyState}`)
		}

		if (this.unreliable_channel) {
			statuses.push(`unreliable:${this.unreliable_channel.readyState}`)
		}

		return statuses.join(' ')
	}


	readonly connect = async (): Promise<void> => {
		await this._signal_driver.connect()

		console.log(`[RTC] connecting`)

		this.peer = new RTCPeerConnection({
			iceServers: [
				{ "urls": ["stun:stun.l.google.com:19302"] },
				// { "urls": ["stun:stun1.l.google.com:19302"] },
				// { "urls": ["stun:stun2.l.google.com:19302"] },
				// { "urls": ["stun:stun3.l.google.com:19302"] },
				// { "urls": ["stun:stun4.l.google.com:19302"] },
			]
		})

		// ----- Reliable Channel -----
		this.reliable_channel = this.peer.createDataChannel('reliable', { negotiated: true, id: 1, ordered: true, })
		this.reliable_channel.onopen = () => {
			console.log('[RTC] reliable channel opened')
			this.on_status_changed?.()
		}
		this.reliable_channel.onclose = () => {
			console.log('[RTC] reliable channel closed')
			this.on_status_changed?.()
		}
		this.reliable_channel.onerror = (ev) => {
			console.log('[RTC] reliable channel error: ', ev)
			this.on_status_changed?.()
		}
		this.reliable_channel.onmessage = (ev) => {
			// console.log('[RTC] reliable message:', ev.data)
			this.on_message_received?.(ev.data)
		}

		// ----- Unreliable Channel -----
		this.unreliable_channel = this.peer.createDataChannel('unreliable', { negotiated: true, id: 2, maxRetransmits: 0, ordered: false, })
		this.unreliable_channel.onopen = () => {
			console.log('[RTC] unreliable channel opened')
			this.on_status_changed?.()
		}
		this.unreliable_channel.onclose = () => {
			console.log('[RTC] unreliable channel closed')
			this.on_status_changed?.()
		}
		this.unreliable_channel.onerror = (ev) => {
			console.log('[RTC] unreliable channel error: ', ev)
			this.on_status_changed?.()
		}
		this.unreliable_channel.onmessage = (ev) => {
			// console.log(ev.data)
			this.on_message_received?.(ev.data)
		}

		// ----- Peer -----
		this.peer.oniceconnectionstatechange = (ev) => {
			console.log('[RTC] ice:', this.peer?.iceConnectionState)
			this.on_status_changed?.()
		}
		this.peer.onicegatheringstatechange = (ev) => {
			console.log('[RTC] gather:', this.peer?.iceGatheringState)
			this.on_status_changed?.()
		}

		this.peer.onicecandidateerror = (ev) => {
			console.error('[RTC] candidate error')
			this.on_status_changed?.()
		}

		this.peer.onconnectionstatechange = (ev) => {
			console.log('[RTC] connect:', this.peer!.connectionState)
			this.on_status_changed?.()

			switch (this.peer?.connectionState) {
				case 'connected':
					setTimeout(() => {
						this.set_connection(this.peer?.connectionState || 'unknown')
						this.on_opened?.()
					}, 2000)
					break
				case 'closed':
					this.on_closed?.()
					break
			}
		}

		this.peer.onsignalingstatechange = (ev) => {
			console.log('[RTC] signal:', this.peer!.signalingState)
			this.on_status_changed?.()
		}

		// ----- Sending data -----
		this.peer.onicecandidate = async (event) => {
			console.log('[RTC] generated candidate: ', event.candidate)

			if (!event.candidate || !event.candidate.candidate) return
			this._signal_driver.send_reliable(this._signal_protocol.candidate(
				event.candidate.candidate,
				event.candidate.sdpMid || '',
				event.candidate.sdpMLineIndex || 0,
				event.candidate.usernameFragment || '',
			))
		}

		// ----- Received Data -----
		this._signal_protocol.on_description = async (type, sdp) => {
			console.log(`[RTC] received ${type}:`, sdp)
			// await new Promise((resolve) => setTimeout(resolve, 2000))
			// console.log('[RTC] Setting desc')
			const desc = new RTCSessionDescription({ type: type as RTCSdpType, sdp })
			this.peer!.setRemoteDescription(desc)

			for (const candidate_obj of this.pending_candidates) {
				console.log('[RTC] adding queued candidate')
				this.peer!.addIceCandidate(candidate_obj)
			}
		}

		this._signal_protocol.on_candidate = async (candidate, sdp_mid, sdp_index, ufrag) => {
			console.log('[RTC] received candidate:', { candidate, sdp_mid, sdp_index, ufrag })

			const candidate_obj: RTCIceCandidateInit = {
				candidate: candidate,
				sdpMid: sdp_mid,
				sdpMLineIndex: sdp_index,
				usernameFragment: ufrag,
			}

			if (this.peer?.remoteDescription) {
				console.log('[RTC] adding candidate immediately')
				this.peer!.addIceCandidate(candidate_obj)
			}
			else {
				console.log('[RTC] adding candidate to queue')
				this.pending_candidates.push(candidate_obj)
			}
		}

		const offer = await this.peer.createOffer()
		console.log('[RTC] created offer:', offer)

		console.log('[RTC] setting local description to offer')
		await this.peer.setLocalDescription(offer)

		console.log('[RTC] sending offer')
		this._signal_driver.send_reliable(this._signal_protocol.description(offer.type, offer.sdp ?? ''))
	}


	readonly disconnect = async (): Promise<void> => {
		console.log('[RTC] disconnecting')
		this._signal_driver.disconnect()

		this.reliable_channel?.close()
		this.unreliable_channel?.close()
		this.peer?.close()

		this.reliable_channel = undefined
		this.unreliable_channel = undefined
		this.peer = undefined
	}


	readonly send_reliable = (message: any): void => {
		if (this.reliable_channel?.readyState != 'open') return
		this.reliable_channel?.send(message)
	}

	readonly send_unreliable = (message: any): void => {
		if (this.unreliable_channel?.readyState != 'open') return
		this.unreliable_channel?.send(message)
	}
}
