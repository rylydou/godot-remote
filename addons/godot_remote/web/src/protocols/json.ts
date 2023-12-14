import { Protocol } from '../protocol'

export default function json_protocol(): Protocol {
	function round(x: number): number {
		return Math.round(x * 100) / 100
	}

	const protocol: Protocol = {
		handle_message: (message) => {
			// `data instanceof String` also works too
			// if (typeof message !== 'string') {
			// 	console.error('[JSON API] Cannot handle packet. The packet is not a string.')
			// 	return
			// }

			const dict = JSON.parse(message)
			if (!dict) {
				console.error('[JSON API] Cannot parse packet. The packet is not valid json.')
				return
			}
			if (!dict._) {
				console.error('[JSON API] Cannot parse packet. The packet is missing and type and is therefore corrupt.')
				return
			}

			switch (dict._) {
				case 'ping':
					protocol.on_ping?.(dict.sts)
					break
				case 'pong':
					protocol.on_pong?.(dict.sts, dict.rts)
					break
				case 'sync':
					protocol.on_sync?.(dict.id)
					break
				case 'sync_all':
					protocol.on_sync_all?.()
					break
				case 'layout':
					protocol.on_layout?.(dict.id)
					break
				case 'alert':
					protocol.on_alert?.(dict.title, dict.body)
					break
				case 'banner':
					protocol.on_banner?.(dict.text)
					break
				case 'clear_banner':
					protocol.on_clear_banner?.()
					break
				default:
					console.error('[JSON API] Unknown packet type: ', dict._)
					break
			}
		},

		ping(sts) {
			return JSON.stringify({
				_: 'ping',
				sts,
			})
		},
		pong(sts, rts) {
			return JSON.stringify({
				_: 'pong',
				sts,
				rts,
			})
		},
		input_btn(id, is_down) {
			return JSON.stringify({
				_: 'input',
				id,
				d: is_down,
			})
		},
		input_axis(id, value) {
			return JSON.stringify({
				_: 'input',
				id,
				v: round(value),
			})
		},
		input_joy(id, x, y) {
			return JSON.stringify({
				_: 'input',
				id: id,
				x: round(x) || 0,
				y: round(y) || 0,
				t: Date.now(),
			})
		},
		name(name) {
			return JSON.stringify({
				_: 'name',
				name,
			})
		},
		session(sid) {
			return JSON.stringify({
				_: 'session',
				sid,
			})
		},
		layout_ready(id) {
			return JSON.stringify({
				_: 'layout_ready',
				id,
			})
		},
	}

	return protocol
}
