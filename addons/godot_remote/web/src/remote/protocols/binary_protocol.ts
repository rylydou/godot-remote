import { RemoteProtocol, ref } from '..'
import { BinView, bin, math } from '../../core'


export class BinaryProtocol extends RemoteProtocol {
	readonly fallback_protocol: RemoteProtocol


	constructor(fallback_protocol: RemoteProtocol) {
		super()

		this.fallback_protocol = fallback_protocol

		fallback_protocol.on_alert = this.on_alert
		fallback_protocol.on_banner = this.on_banner
		fallback_protocol.on_clear_banner = this.on_clear_banner
		fallback_protocol.on_layout = this.on_layout
		fallback_protocol.on_ping = this.on_ping
		fallback_protocol.on_pong = this.on_pong
		fallback_protocol.on_sync = this.on_sync
		fallback_protocol.on_sync_all = this.on_sync_all

		this.layout_ready = fallback_protocol.layout_ready
	}


	override parse_message(message: any): void {
		if (typeof message === 'string') {
			this.fallback_protocol.parse_message(message)
			return
		}

		if (!(message instanceof ArrayBuffer)) {
			console.warn('[BIN] unexpected message data:', message)
			return
		}

		const bin = new BinView(message)
		const type = bin.get_byte()
		switch (type) {
			case 0: { // JSON API call
				const json = bin.get_str()
				this.fallback_protocol.parse_message(json)
				break
			}

			case 1: { // Ping
				const sts = bin.get_uint()
				this.on_ping?.(sts)
				break
			}

			case 2: { // Pong
				const sts = bin.get_uint()
				this.on_pong?.(sts)
				break
			}
		}
	}


	text_packet(message: any): any {
		return bin()
			.byte(0)
			.str(message)
			.array_buffer()
	}


	override input_btn(id: ref, down: boolean): any {
		return bin()
			.byte(id as number + (down ? 0 : 1))
			.array_buffer()
	}


	override input_joy_move(id: ref, x: number, y: number): any {
		return bin()
			.byte(id as number)
			.fixed_sbyte(x)
			.fixed_sbyte(y)
			.array_buffer()
	}

	override input_joy_down(id: ref, x: number, y: number): any {
		return bin()
			.byte(id as number + 1)
			.fixed_sbyte(x)
			.fixed_sbyte(y)
			.array_buffer()
	}

	override input_joy_up(id: ref, x: number, y: number): any {
		return bin()
			.byte(id as number + 2)
			.fixed_sbyte(x)
			.fixed_sbyte(y)
			.array_buffer()
	}
}
