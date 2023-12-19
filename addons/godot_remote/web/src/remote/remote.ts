import { Driver, RemotePlugin, RemoteProtocol, get_session_id } from '.'
import { Engine } from '../core'
import { RTCDriver } from './drivers/rtc'
import { WSDriver } from './drivers/ws'
import { BinaryProtocol, JSONProtocol } from './protocols'


export class Remote extends Engine {
	readonly driver_type: string = '$_DRIVER_$'
	readonly protocol_type: string = '$_PROTOCOL_$'


	readonly protocol: RemoteProtocol
	readonly driver: Driver


	readonly send_queue: any[] = []


	name = '(unnamed)'
	session_id: number
	tick_rate = 30


	constructor(canvas: HTMLCanvasElement) {
		super(canvas)

		if (this.driver_type.startsWith('$')) {
			this.driver_type = 'RTC'
			console.warn(`[Remote] no driver is defined - assuming '${this.driver_type}' which may not be correct`)
		} else {
			console.log('[Remote] driver:', this.driver_type)
		}

		if (this.protocol_type.startsWith('$')) {
			this.protocol_type = 'JSON'
			console.warn(`[Remote] no protocol is defined - assuming '${this.protocol_type}' which may not be correct`)
		}
		else {
			console.log('[Remote] protocol:', this.protocol_type)
		}

		switch (this.driver_type) {
			default: throw new Error('[Remote] unknown driver type: ' + this.driver_type)

			case 'WS':
				this.driver = new WSDriver()
				break

			case 'RTC':
				this.driver = new RTCDriver()
				break
		}

		switch (this.protocol_type) {
			default: throw new Error('[Remote] unknown protocol type: ' + this.protocol_type)

			case 'JSON':
				this.protocol = new JSONProtocol()
				break

			case 'BIN/JSON':
				this.protocol = new BinaryProtocol(new JSONProtocol())
				break
		}

		this.driver.on_message_received = (message) => this.protocol.parse_message(message)

		this.session_id = get_session_id()
		console.log('[Remote] session id:', this.session_id)
		this.send(this.protocol.session(this.session_id))

		this.tick()

		this.driver.on_connection_changed = (state) => {
			if (state === 'connected') {
				for (const plugin of this.plugin_iter()) {
					(plugin as RemotePlugin).connected?.()
				}

				for (const message of this.send_queue) {
					this.driver.send_reliable(message)
				}
			}
			else {
				for (const plugin of this.plugin_iter()) {
					(plugin as RemotePlugin).disconnected?.()
				}
			}
		}
	}


	async connect(): Promise<void> {
		window.scroll({ left: 0, top: 0, })
		await this.driver.connect()
		window.scroll({ left: 0, top: 0, })
	}


	async disconnect(): Promise<void> {
		await this.driver.disconnect()
	}


	create_plugin(id: string): RemotePlugin {
		const plugin: RemotePlugin = {
			id,
			engine: this,
			remote: this,

			trace: (data) => console.trace(`[${id}] `, data),
			debug: (data) => console.debug(`[${id}] `, data),
			log: (data) => console.log(`[${id}] `, data),
			warn: (data) => console.warn(`[${id}] `, data),
			error: (data) => console.error(`[${id}] `, data),
		}

		this.plugins.push(plugin)
		return plugin
	}


	tick(): void {
		for (const plugin of this.plugin_iter()) {
			(plugin as RemotePlugin).tick?.()
		}

		setTimeout(() => this.tick(), 1000 / this.tick_rate)
	}


	is_connection_dropped = false
	set_connection_dropped(is_connection_dropped: boolean) {
		if (this.is_connection_dropped == is_connection_dropped) return
		this.is_connection_dropped = is_connection_dropped

		for (const plugin of this.plugin_iter()) {
			const remote_plugin = plugin as RemotePlugin
			if (is_connection_dropped)
				remote_plugin?.connection_dropped?.()
			else
				remote_plugin?.connection_regained?.()
		}
	}


	send(message: any): void {
		if (this.driver.connection_state === 'connected') {
			this.driver.send_reliable(message)
			return
		}
		this.send_queue.push(message)
	}
}
