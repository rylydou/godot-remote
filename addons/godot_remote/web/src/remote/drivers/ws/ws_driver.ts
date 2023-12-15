import { Driver } from '../../driver'

export class WSDriver extends Driver {
	readonly name = 'WebSocket'

	readonly address: string


	private _ws?: WebSocket


	constructor(address = '$_WS_ADDRESS_$') {
		super()
		if (address === '' || address.startsWith('$')) {
			address = `ws://${location.hostname}:8081`
			console.warn(`[ws] no address is defined - assuming '${address}' which may not be correct`)
		}
		this.address = address
	}


	connect = async (): Promise<void> => {
		console.log(`[ws] connecting to '${this.address}'`)
		this._ws = new WebSocket(this.address)
		this.set_connection('connecting')

		this._ws.onopen = (ev) => {
			console.log(`[ws] opened`)
			this.set_connection('connected')
			this.on_opened?.()
		}

		this._ws.onclose = (ev) => {
			console.log(`[ws] closed`)
			if (this.connection_state != 'failed')
				this.set_connection('closed')
			this.on_opened?.()
		}

		this._ws.onerror = (ev) => {
			console.error(`[ws] error`, ev)
			this.set_connection('failed')
			this.set_status('error: ' + ev)
			this.on_error?.(ev)
			this.disconnect()
		}

		this._ws.onmessage = (message) => this.on_message_received?.(message)
	}

	disconnect = async (): Promise<void> => {
		console.log(`[ws] disconnecting`)
		this._ws?.close()
	}


	send_reliable = (message: any): void => {
		this._ws?.send(message)
	}

	send_unreliable = (message: any): void => {
		this._ws?.send(message)
	}
}
