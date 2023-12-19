import { RemoteProtocol, ref } from '..'


export class JSONProtocol extends RemoteProtocol {
	override parse_message(message: any): void {
		const dict = JSON.parse(message)
		if (!dict) {
			console.error('[JSON] cannot parse message - the message is not valid json')
			return
		}
		if (!dict._) {
			console.error('[JSON] cannot parse message - the message is missing a type')
			return
		}

		switch (dict._) {
			case 'ping':
				this.on_ping?.(dict.t)
				break
			case 'pong':
				this.on_pong?.(dict.t)
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
				console.error('[JSON] unknown packet type: ', dict._)
				break
		}
	}


	round(x: number): number {
		return Math.round(x * 100) / 100
	}


	override ping(timestamp: number): any {
		return JSON.stringify({
			_: 'ping',
			t: timestamp,
		})
	}

	override pong(timestamp: number): any {
		return JSON.stringify({
			_: 'pong',
			t: timestamp,
		})
	}

	override session(sid: number): any {
		return JSON.stringify({
			_: 'session',
			sid,
		})
	}

	override name(name: string): any {
		return JSON.stringify({
			_: 'name',
			name,
		})
	}

	override leave(): any {
		return JSON.stringify({
			_: 'leave',
		})
	}

	override layout_ready(id: ref): any {
		return JSON.stringify({
			_: 'layout_ready',
			id,
		})
	}


	override input_btn(id: ref, is_down: boolean): any {
		return JSON.stringify({
			_: 'input',
			id,
			t: Date.now(),
			d: is_down,
		})
	}

	override input_joy_move(id: ref, x: number, y: number): any {
		return JSON.stringify({
			_: 'input',
			id: id,
			t: Date.now(),
			x: this.round(x),
			y: this.round(y),
		})
	}

	override input_joy_down(id: ref, x: number, y: number): any {
		return JSON.stringify({
			_: 'input',
			id: id,
			t: Date.now(),
			d: 'down',
			x: this.round(x),
			y: this.round(y),
		})
	}


	override input_joy_up(id: ref, x: number, y: number): any {
		return JSON.stringify({
			_: 'input',
			id: id,
			t: Date.now(),
			d: 'up',
			x: this.round(x),
			y: this.round(y),
		})
	}
}
