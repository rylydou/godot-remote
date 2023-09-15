import { API, ref } from '../api'

export function json_api(send_packet: (data: any) => void): API {
	function send_json(data: object): void {
		var json = JSON.stringify(data)
		send_packet(json)
	}

	function round(x: number): number {
		return Math.round(x * 100) / 100
	}

	const api = {
		send_packet: send_packet,
		handle_packet(data) {
			// `data instanceof String` also works too
			// if (typeof data !== 'string') {
			// 	console.error('[JSON API] Cannot handle packet. The packet is not a string.')
			// 	return
			// }

			const dict = JSON.parse(data)
			if (!dict) return
			if (!dict._) return

			switch (dict._) {
				case 'ping':
					api.receive_ping(dict.sts)
					break
				case 'pong':
					api.receive_pong(dict.sts, dict.rts)
					break
				case 'sync':
					api.receive_sync(dict.id)
					break
				case 'sync_all':
					api.receive_sync_all()
					break
				case 'layout':
					api.receive_layout(dict.id)
					break
				case 'alert':
					api.receive_alert(dict.title, dict.body)
					break
				case 'banner':
					api.receive_banner(dict.text)
					break
				case 'clear_banner':
					api.receive_clear_banner()
					break
			}
		},

		receive_ping(sts) { },
		receive_pong(sts, rts) { },
		receive_sync(id) { },
		receive_sync_all() { },
		receive_layout(id) { },
		receive_alert(title, body) { },
		receive_banner(text) { },
		receive_clear_banner() { },

		send_ping(sts) {
			send_json({
				_: 'ping',
				sts: sts,
			})
		},
		send_pong(sts, rts) {
			send_json({
				_: 'pong',
				sts: sts,
				rts: rts,
			})
		},
		send_input_btn(id, is_down) {
			send_json({
				_: 'input',
				id: id,
				d: is_down,
			})
		},
		send_input_axis(id, value) {
			send_json({
				_: 'input',
				id: id,
				v: round(value),
			})
		},
		send_input_joy(id, x, y) {
			send_json({
				_: 'input',
				id: id,
				x: round(x),
				y: round(y),
			})
		},
		send_name(name) {
			send_json({
				_: 'name',
				name: name,
			})
		},
		send_session(sid) {
			send_json({
				_: 'session',
				sid: sid,
			})
		},
		send_layout_ready(id) {
			send_json({
				_: 'layout_ready',
				id: id,
			})
		},
	} as API

	return api
}
