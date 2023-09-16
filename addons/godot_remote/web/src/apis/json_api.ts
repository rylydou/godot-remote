import { API, ref } from '../api'
import { Driver } from '../driver'

export function create_json_api(driver: Driver): API {
	function round(x: number): number {
		return Math.round(x * 100) / 100
	}

	function send_reliable(message: Object) {
		driver.send_reliable(JSON.stringify(message))
	}
	function send_unreliable(message: Object) {
		driver.send_unreliable(JSON.stringify(message))
	}

	const api = {
		driver: driver,

		receive_ping(sts) { },
		receive_pong(sts, rts) { },
		receive_sync(id) { },
		receive_sync_all() { },
		receive_layout(id) { },
		receive_alert(title, body) { },
		receive_banner(text) { },
		receive_clear_banner() { },

		send_ping(sts) {
			send_reliable({
				_: 'ping',
				sts: sts,
			})
		},
		send_pong(sts, rts) {
			send_reliable({
				_: 'pong',
				sts: sts,
				rts: rts,
			})
		},
		send_input_btn(id, is_down) {
			send_reliable({
				_: 'input',
				id: id,
				d: is_down,
			})
		},
		send_input_axis(id, value) {
			send_unreliable({
				_: 'input',
				id: id,
				v: round(value),
			})
		},
		send_input_joy(id, x, y) {
			send_unreliable({
				_: 'input',
				id: id,
				x: round(x),
				y: round(y),
			})
		},
		send_name(name) {
			send_reliable({
				_: 'name',
				name: name,
			})
		},
		send_session(sid) {
			send_reliable({
				_: 'session',
				sid: sid,
			})
		},
		send_layout_ready(id) {
			send_reliable({
				_: 'layout_ready',
				id: id,
			})
		},
	} as API

	api.driver.on_message = (message) => {
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
			default:
				console.error('[JSON API] Unknown packet type: ', dict._)
				break
		}
	}

	return api
}
