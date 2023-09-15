import { Driver } from '../driver'

export function create_webrtc_driver(): Driver {
	let local: RTCPeerConnection
	let remote: RTCPeerConnection

	let send_reliable_channel: RTCDataChannel
	let receive_channel: RTCDataChannel

	function candidate_error(reason: any) {
		console.error('[WebRTC] Candidate error. Reason: ', reason)
	}

	function description_error(reason: any) {
		console.error('[WebRTC] Description error. Reason: ', reason)
	}

	const driver = {
		connect(address) {
			local = new RTCPeerConnection()
			remote = new RTCPeerConnection()

			send_reliable_channel = local.createDataChannel('send_reliable', { ordered: true, })

			remote.ondatachannel = (event) => {
				receive_channel = event.channel
			}

			local.onicecandidate = (e) =>
				!e.candidate ||
				remote.addIceCandidate(e.candidate).catch(candidate_error)

			remote.onicecandidate = (e) =>
				!e.candidate ||
				remote.addIceCandidate(e.candidate).catch(candidate_error)

			local.createOffer()
				.then(offer => local.setLocalDescription(offer))
				.then(() => remote.setRemoteDescription(local.localDescription!))
				.then(() => remote.createAnswer())
				.then(answer => remote.setLocalDescription(answer))
				.then(() => local.setRemoteDescription(remote.localDescription!))
				.catch(description_error)
		},
	} as Driver
	return driver
}
