import { Driver } from '../driver'

export function create_webrtc_driver(): Driver {
	let local: RTCPeerConnection | null = null
	let remote: RTCPeerConnection | null = null

	let send_reliable_channel: RTCDataChannel | null = null
	let send_unreliable_channel: RTCDataChannel | null = null
	let receive_channel: RTCDataChannel | null = null

	function candidate_error(reason: any) {
		console.error('[WebRTC] Candidate error. Reason: ', reason)
	}

	function description_error(reason: any) {
		console.error('[WebRTC] Description error. Reason: ', reason)
	}

	const driver = {
		connect(address) {
			console.log('[WebRTC] Connecting to ', address)

			local = new RTCPeerConnection({})
			send_reliable_channel = local.createDataChannel('reliable', { negotiated: true, id: 1 })
			send_reliable_channel.onopen = () => console.log('[WebRTC] Reliable channel opened.')
			send_reliable_channel.onclose = () => console.log('[WebRTC] Reliable channel closed.')
			send_unreliable_channel = local.createDataChannel('unreliable', { negotiated: true, id: 2, maxRetransmits: 0, ordered: false, })
			send_unreliable_channel.onopen = () => console.log('[WebRTC] Unreliable channel opened.')
			send_unreliable_channel.onclose = () => console.log('[WebRTC] Unreliable channel closed.')

			remote = new RTCPeerConnection({})
			receive_channel = remote.createDataChannel('reliable', { negotiated: true, id: 1 })

			local.onicecandidate = (e) =>
				!e.candidate ||
				remote!.addIceCandidate(e.candidate).catch(candidate_error)

			remote.onicecandidate = (e) =>
				!e.candidate ||
				remote!.addIceCandidate(e.candidate).catch(candidate_error)

			local.createOffer()
				.then(offer => {
					console.log('[WebRTC] Setting local description to offer.')
					return local!.setLocalDescription(offer)
				})
				.then(() => {
					console.log('[WebRTC] Setting remote description to local description.')
					return remote!.setRemoteDescription(local!.localDescription!)
				})
				.then(() => {
					console.log('[WebRTC] Creating answer on remote.')
					return remote!.createAnswer()
				})
				.then(answer => {
					console.log('[WebRTC] Setting remote description to answer.')
					return remote!.setLocalDescription(answer)
				})
				.then(() => {
					console.log('[WebRTC] Setting local description to remote description.')
					return local!.setRemoteDescription(remote!.localDescription!)
				})
				.catch(description_error)
		},
		disconnect() {
			console.log('[WebRTC] Disconnecting.')
			send_reliable_channel?.close()
			send_unreliable_channel?.close()
			receive_channel?.close()
			local?.close()
			remote?.close()

			send_reliable_channel = null
			send_unreliable_channel = null
			receive_channel = null
			local = null
			remote = null
		},
		send_reliable(message) {
			send_reliable_channel?.send(message)
		},
		send_unreliable(message) {
			send_unreliable_channel?.send(message)
		},
	} as Driver
	return driver
}
