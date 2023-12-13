export interface RtcSignalProtocol {
	readonly handle_message: (message: any) => void

	readonly description: (type: string, sdp: string) => any
	readonly candidate: (candidate: string, sdp_mid: string, sdp_index: number) => any

	on_ready?: (peer_id: number) => void
	on_description?: (type: string, sdp: string) => void
	on_candidate?: (candidate: string, sdp_mid: string, sdp_index: number) => void
}

export function rtc_signal_protocol(): RtcSignalProtocol {
	const protocol: RtcSignalProtocol = {
		handle_message(message) {
			// `data instanceof String` also works too
			// if (typeof message !== 'string') {
			// 	console.error('[RTC API] Cannot handle packet. The packet is not a string.')
			// 	return
			// }

			// console.log('[RTC API] ', message)

			const dict = JSON.parse(message)
			if (!dict) {
				console.error('[RTC API] Cannot parse packet. The packet is not valid json.')
				return
			}
			if (!dict._) {
				console.error('[RTC API] Cannot parse packet. The packet is missing and type and is therefore corrupt.')
				return
			}

			switch (dict._) {
				case 'ready':
					protocol.on_ready?.(dict.peer_id)
					break
				case 'description':
					protocol.on_description?.(dict.type, dict.sdp)
					break
				case 'candidate':
					protocol.on_candidate?.(dict.candidate, dict.sdp_mid, dict.sdp_index)
					break
				default:
					console.error('[RTC API] Unknown packet type: ', dict._)
					break
			}
		},
		description: (type, sdp) => {
			return JSON.stringify({
				_: 'description',
				type,
				sdp,
			})
		},
		candidate: (candidate, sdp_mid, sdp_index) => {
			return JSON.stringify({
				_: 'candidate',
				candidate,
				sdp_mid,
				sdp_index,
			})
		},
	}
	return protocol
}
