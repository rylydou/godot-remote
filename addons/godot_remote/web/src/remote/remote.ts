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


	session_id: number
	tick_rate = 30


	constructor(canvas: HTMLCanvasElement) {
		super(canvas)

		if (this.driver_type.startsWith('$')) {
			this.driver_type = 'WS'
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
		this.driver.on_opened = () => {
			console.log('[Remote] sending session id')
			this.driver.send_reliable(this.protocol.session(this.session_id))
		}

		this.session_id = get_session_id()
		console.log('[Remote] session id:', this.session_id)
		this.tick()
	}


	async connect(): Promise<void> {
		await this.driver.connect()

		for (const plugin of this.plugin_stack_iter()) {
			(plugin as RemotePlugin).connected?.()
		}
	}


	async disconnect(): Promise<void> {
		await this.driver.disconnect()

		for (const plugin of this.plugin_stack_iter()) {
			(plugin as RemotePlugin).disconnected?.()
		}
	}


	create_plugin(id: string): RemotePlugin {
		const plugin: RemotePlugin = {
			engine: this,
			id: id,

			trace: (data) => console.trace(`[${id}] `, data),
			debug: (data) => console.debug(`[${id}] `, data),
			log: (data) => console.log(`[${id}] `, data),
			warn: (data) => console.warn(`[${id}] `, data),
			error: (data) => console.error(`[${id}] `, data),
		}

		this.plugins.set(id, plugin)
		return plugin
	}


	tick() {
		setTimeout(() => this.tick(), 1000 / this.tick_rate)

		for (const plugin of this.plugin_stack_iter()) {
			(plugin as RemotePlugin).tick?.()
		}
	}
}
