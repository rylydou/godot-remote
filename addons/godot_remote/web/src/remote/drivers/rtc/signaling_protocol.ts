export class SignalingProtocol {
	parse_message(message: any): void {
		const dict = JSON.parse(message)

		if (!dict) {
			console.error('[signal] cannot parse packet - the packet is not valid json')
			return
		}

		if (!dict._) {
			console.error('[signal] cannot parse packet - the packet is missing a type')
			return
		}

		switch (dict._) {
			// case 'ready':
			// this.on_ready?.(dict.peer_id)
			// break
			case 'description':
				this.on_description?.(dict.type, dict.sdp)
				break
			case 'candidate':
				this.on_candidate?.(dict.candidate, dict.sdp_mid, dict.sdp_index, dict.ufrag)
				break
			default:
				console.error('[signal] unknown packet type: ', dict._)
				break
		}
	}

	// on_ready?: (peer_id: number) => void
	on_description?: (type: string, sdp: string) => void
	on_candidate?: (candidate: string, sdp_mid: string, sdp_index: number, ufrag: string) => void


	description(type: string, sdp: string): string {
		return JSON.stringify({
			_: 'description',
			type,
			sdp,
		})
	}

	candidate(candidate: string, sdp_mid: string, sdp_index: number, ufrag: string): string {
		return JSON.stringify({
			_: 'candidate',
			candidate,
			sdp_mid,
			sdp_index,
			ufrag,
		})
	}
}
