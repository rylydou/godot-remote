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


	constructor(canvas: HTMLCanvasElement) {
		super(canvas)

		if (this.driver_type.startsWith('$')) {
			this.driver_type = 'WS'
			console.warn(`[Remote] no driver is defined - assuming '${this.driver_type}' which may not be correct`)
		}

		if (this.protocol_type.startsWith('$')) {
			this.protocol_type = 'JSON'
			console.warn(`[Remote] no protocol is defined - assuming '${this.protocol_type}' which may not be correct`)
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

			case 'BIN':
				this.protocol = new BinaryProtocol()
				break
		}

		this.driver.on_opened = () => {
			console.log('opened, sending session id')
			this.driver.send_reliable(this.protocol.session(this.session_id))
		}

		this.driver.on_message_received = (message) => this.protocol.parse_message(message)

		this.session_id = get_session_id()
	}


	async connect(): Promise<void> {
		await this.driver.connect()
	}


	async disconnect(): Promise<void> {
		await this.driver.disconnect()
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
}
