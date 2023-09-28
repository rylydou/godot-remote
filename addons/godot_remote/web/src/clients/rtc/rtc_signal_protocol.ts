export interface RtcSignalProtocol {
	readonly handle_message: (message: any) => void

	readonly description: (sdp: string, type: string) => any
	readonly candidate: (media: string, index: number, name: string) => any

	on_ready?: (peer_id: number) => void
	on_description?: (sdp: string, type: string) => void
	on_candidate?: (media: string, index: number, name: string) => void
}

export function rtc_signal_protocol(): RtcSignalProtocol {
	const protocol: RtcSignalProtocol = {
		handle_message(message) {
			// `data instanceof String` also works too
			// if (typeof message !== 'string') {
			// 	console.error('[RTC API] Cannot handle packet. The packet is not a string.')
			// 	return
			// }

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
					protocol.on_description?.(dict.sdp, dict.type)
					break
				case 'candidate':
					protocol.on_candidate?.(dict.media, dict.index, dict.name)
					break
				default:
					console.error('[RTC API] Unknown packet type: ', dict._)
					break
			}
		},
		description: (sdp, type) => {
			return JSON.stringify({
				_: 'description',
				type,
				sdp,
			})
		},
		candidate: (media, index, name) => {
			return JSON.stringify({
				_: 'candidate',
				media,
				index,
				name,
			})
		},
	}
	return protocol
}
