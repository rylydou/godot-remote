import { RemoteProtocol, ref } from '..'


export class JSONProtocol extends RemoteProtocol {
	readonly parse_message = (message: any): void => {
		const dict = JSON.parse(message)
		if (!dict) {
			console.error('[json] cannot parse message - the message is not valid json')
			return
		}
		if (!dict._) {
			console.error('[json] cannot parse message - the message is missing a type')
			return
		}

		switch (dict._) {
			case 'ping':
				this.on_ping?.(dict.sts)
				break
			case 'pong':
				this.on_pong?.(dict.sts, dict.rts)
				break
			case 'sync':
				this.on_sync?.(dict.id)
				break
			case 'sync_all':
				this.on_sync_all?.()
				break
			case 'layout':
				this.on_layout?.(dict.id)
				break
			case 'alert':
				this.on_alert?.(dict.title, dict.body)
				break
			case 'banner':
				this.on_banner?.(dict.text)
				break
			case 'clear_banner':
				this.on_clear_banner?.()
				break
			default:
				console.error('[JSON API] Unknown packet type: ', dict._)
				break
		}
	}


	round(x: number): number {
		return Math.round(x * 100) / 100
	}


	readonly ping = (sts: number): any => {
		return JSON.stringify({
			_: 'ping',
			sts,
		})
	}

	readonly pong = (sts: number, rts: number): any => {
		return JSON.stringify({
			_: 'pong',
			sts,
			rts,
		})
	}

	readonly name = (name: string): any => {
		return JSON.stringify({
			_: 'name',
			name,
		})
	}

	readonly session = (sid: number): any => {
		return JSON.stringify({
			_: 'session',
			sid,
		})
	}

	readonly layout_ready = (id: ref): any => {
		return JSON.stringify({
			_: 'layout_ready',
			id,
		})
	}


	readonly input_btn = (id: ref, is_down: boolean): any => {
		return JSON.stringify({
			_: 'input',
			id,
			d: is_down,
		})
	}

	readonly input_axis = (id: ref, value: number): any => {
		return JSON.stringify({
			_: 'input',
			id,
			v: this.round(value),
		})
	}

	readonly input_joy_down = (id: ref, x: number, y: number): any => {
		return JSON.stringify({
			_: 'input',
			id: id,
			s: 'down',
			x: this.round(x),
			y: this.round(y),
			t: Date.now(),
		})
	}

	readonly input_joy_move = (id: ref, x: number, y: number): any => {
		return JSON.stringify({
			_: 'input',
			id: id,
			s: 'move',
			x: this.round(x),
			y: this.round(y),
			t: Date.now(),
		})
	}

	readonly input_joy_up = (id: ref, x: number, y: number): any => {
		return JSON.stringify({
			_: 'input',
			id: id,
			s: 'up',
			x: this.round(x),
			y: this.round(y),
			t: Date.now(),
		})
	}
}
