import { Driver } from '../../driver'
import { WSDriver } from '../ws'
import { SignalingProtocol } from './signaling_protocol'


export class RTCDriver extends Driver {
	readonly name = 'WebRTC'

	readonly _signal_protocol: SignalingProtocol
	readonly _signal_driver: Driver


	private peer?: RTCPeerConnection
	private reliable_channel?: RTCDataChannel
	private unreliable_channel?: RTCDataChannel


	constructor() {
		super()
		this._signal_protocol = new SignalingProtocol()
		this._signal_driver = new WSDriver('$_SIGNAL_WS_ADDRESS_$')
		this._signal_driver.on_message_received = (message) => this._signal_protocol.parse_message(message)
	}


	readonly connect = async (): Promise<void> => {
		console.log(`[rtc] connecting`)

		this.peer = new RTCPeerConnection({
			iceServers: [
				{ "urls": ["stun:stun.l.google.com:19302"] },
				// { "urls": ["stun:stun1.l.google.com:19302"] },
				// { "urls": ["stun:stun2.l.google.com:19302"] },
				// { "urls": ["stun:stun3.l.google.com:19302"] },
				// { "urls": ["stun:stun4.l.google.com:19302"] },
			]
		})

		this.reliable_channel = this.peer.createDataChannel('reliable', { negotiated: true, id: 1 })
		this.reliable_channel.onopen = () => {
			console.log('[rtc] reliable channel opened')
		}
		this.reliable_channel.onclose = () => {
			console.log('[rtc] reliable channel closed')
		}
		this.reliable_channel.onerror = (ev) => {
			console.log('[rtc] reliable channel error: ', ev)
		}
		this.reliable_channel.onmessage = (ev) => {
			console.log('[rtc] reliable message:', ev.data)
			this.on_message_received?.(ev.data)
		}

		this.unreliable_channel = this.peer.createDataChannel('unreliable', { negotiated: true, id: 2, maxRetransmits: 0, ordered: false, })
		this.unreliable_channel.onopen = () => {
			console.log('[rtc] unreliable channel opened.')
		}
		this.unreliable_channel.onclose = () => {
			console.log('[rtc] unreliable channel closed.')
		}
		this.unreliable_channel.onerror = (ev) => {
			console.log('[rtc] unreliable channel error: ', ev)
		}
		this.unreliable_channel.onmessage = (ev) => {
			this.on_message_received?.(ev.data)
		}

		this.peer.onicecandidateerror = () => {
			console.error('[rtc] candidate error')
		}
		this.peer.onicecandidate = async (event) => {
			console.log('[rtc] local candidate: ', event.candidate)
			if (!event.candidate) return
			this._signal_driver.send_reliable(this._signal_protocol.candidate(
				event.candidate.candidate,
				event.candidate.sdpMid || '',
				event.candidate.sdpMLineIndex || 0,
				event.candidate.usernameFragment || '',
			))
		}

		this.peer.onconnectionstatechange = (ev) => {
			console.log('[rtc] peer:', this.peer!.connectionState)
			this.set_connection(this.peer?.connectionState || 'new')
		}

		this._signal_protocol.on_description = async (type, sdp) => {
			console.log(`[rtc] received ${type}:`, sdp)
			// await new Promise((resolve) => setTimeout(resolve, 2000))
			// console.log('[rtc] Setting desc')
			const desc = new RTCSessionDescription({ type: type as RTCSdpType, sdp })
			this.peer!.setRemoteDescription(desc)
		}

		this._signal_protocol.on_candidate = async (candidate, sdp_mid, sdp_index, ufrag) => {
			console.log('[rtc] received candidate:', { candidate, sdp_mid, sdp_index })

			await new Promise<void>((resolve) => setTimeout(resolve, 2000))
			this.peer!.addIceCandidate({
				candidate: candidate,
				sdpMid: sdp_mid,
				sdpMLineIndex: sdp_index,
				usernameFragment: ufrag,
			})
		}

		console.log('[rtc] creating offer')
		const offer = await this.peer.createOffer()
		console.log(offer)

		console.log('[rtc] setting local description to offer')
		await this.peer.setLocalDescription(offer)

		console.log('[rtc] sending offer')
		this._signal_driver.send_reliable(this._signal_protocol.description(offer.type, offer.sdp ?? ''))
	}


	readonly disconnect = async (): Promise<void> => {
		console.log('[rtc] disconnecting')
		this.reliable_channel?.close()
		this.unreliable_channel?.close()
		this.peer?.close()

		this.reliable_channel = undefined
		this.unreliable_channel = undefined
		this.peer = undefined
	}


	readonly send_reliable = (message: any): void => {
		this.reliable_channel?.send(message)
	}

	readonly send_unreliable = (message: any): void => {
		this.unreliable_channel?.send(message)
	}
}
