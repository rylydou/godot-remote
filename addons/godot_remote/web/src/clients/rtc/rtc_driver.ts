import { Client } from '../../client'
import { RtcSignalProtocol } from './rtc_signal_protocol'

export function rtc_driver(protocol: RtcSignalProtocol, driver: Client) {
	let peer_id: number
	let peer: RTCPeerConnection | null = null
	let reliable_channel: RTCDataChannel | null = null
	let unreliable_channel: RTCDataChannel | null = null

	function update_connection_state() {
		const was_connected = client.is_connected
		client.is_connected = true
		if (peer?.connectionState != 'connected')
			client.is_connected = false
		else if (reliable_channel?.readyState != 'open')
			client.is_connected = false
		else if (unreliable_channel?.readyState != 'open')
			client.is_connected = false

		if (was_connected != client.is_connected) {
			client.on_status_change?.()
			if (client.is_connected)
				client.on_open?.()
			else
				client.on_close?.()
			client.on_status_change?.()
		}
	}

	protocol.on_ready = (_peer_id) => {
		peer_id = _peer_id
		client.connect()
	}

	const client: Client = {
		name: 'RTC Client',
		is_connected: false,

		async connect() {
			console.log(`[RTC] Initializing #${peer_id}`)

			peer = new RTCPeerConnection({
				iceServers: [
					{ "urls": ["stun:stun.l.google.com:19302"] },
					// { "urls": ["stun:stun1.l.google.com:19302"] },
					// { "urls": ["stun:stun2.l.google.com:19302"] },
					// { "urls": ["stun:stun3.l.google.com:19302"] },
					// { "urls": ["stun:stun4.l.google.com:19302"] },
				]
			})

			reliable_channel = peer.createDataChannel('reliable', { negotiated: true, id: 1 })
			reliable_channel.onopen = () => {
				console.log('[RTC] Reliable channel opened.')
				update_connection_state()
			}
			reliable_channel.onclose = () => {
				console.log('[RTC] Reliable channel closed.')
				update_connection_state()
			}
			reliable_channel.onerror = (ev) => {
				console.log('[RTC] Reliable channel error: ', ev)
				update_connection_state()
			}
			reliable_channel.onmessage = (ev) => {
				console.log('[RTC] Reliable message:', ev.data)
				client.on_message?.(ev.data)
			}

			unreliable_channel = peer.createDataChannel('unreliable', { negotiated: true, id: 2, maxRetransmits: 0, ordered: false, })
			unreliable_channel.onopen = () => {
				console.log('[RTC] Unreliable channel opened.')
				update_connection_state()
			}
			unreliable_channel.onclose = () => {
				console.log('[RTC] Unreliable channel closed.')
				update_connection_state()
			}
			unreliable_channel.onerror = (ev) => {
				console.log('[RTC] Unreliable channel error: ', ev)
				update_connection_state()
			}
			unreliable_channel.onmessage = (ev) => {
				client.on_message?.(ev.data)
			}

			peer.onicecandidateerror = () => {
				console.error('[RTC] Candidate error.')
				update_connection_state()
			}
			peer.onicecandidate = async (event) => {
				console.log('[RTC] Local candidate: ', event.candidate)
				if (event.candidate && event.candidate.candidate) {
					// event.candidate.usernameFragment || ''
					driver.send_reliable(protocol.candidate(
						event.candidate.candidate,
						event.candidate.sdpMid || '',
						event.candidate.sdpMLineIndex || 0,
					))
				}
				else {
					// driver.send_reliable(protocol.candidate(''))
				}
			}

			peer.onconnectionstatechange = (ev) => {
				console.log('[RTC] Peer:', peer!.connectionState)
				update_connection_state()
			}

			protocol.on_description = async (type, sdp) => {
				console.log(`[RTC] Received ${type}:`, sdp)
				// await new Promise((resolve) => setTimeout(resolve, 3000))
				console.log('[RTC] Setting desc')
				const desc = new RTCSessionDescription({ type: type as RTCSdpType, sdp })
				peer!.setRemoteDescription(desc)
			}

			protocol.on_candidate = async (candidate, sdp_mid, sdp_index) => {
				// await new Promise<void>((resolve) => setTimeout(resolve, 2000))
				console.log('[RTC] Received candidate:', { candidate, sdp_mid, sdp_index })
				peer!.addIceCandidate({ candidate, sdpMid: sdp_mid, sdpMLineIndex: sdp_index, /* usernameFragment: name */ })
			}

			console.log('[RTC] Creating offer.')
			const offer = await peer.createOffer()
			console.log(offer)

			console.log('[RTC] Setting local description to offer.')
			await peer.setLocalDescription(offer)

			console.log('[RTC] Sending offer.')
			driver.send_reliable(protocol.description(offer.type, offer.sdp ?? ''))
		},
		async disconnect() {
			console.log('[RTC] Disconnecting.')
			reliable_channel?.close()
			unreliable_channel?.close()
			peer?.close()

			reliable_channel = null
			unreliable_channel = null
			peer = null!
		},
		send_reliable(message: any) {
			reliable_channel?.send(message)
		},
		send_unreliable(message: any) {
			unreliable_channel?.send(message)
		},
		get_status() {
			if (!peer) return 'uninitialized'
			return `${peer.connectionState} ${reliable_channel?.readyState} ${unreliable_channel?.readyState}`
		},
	}
	return client
}
