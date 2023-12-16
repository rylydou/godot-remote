import { Driver } from '../../driver'

export class WSDriver extends Driver {
	readonly name = 'WebSocket'

	readonly address: string


	private _ws?: WebSocket


	constructor(address = '$_WS_ADDRESS_$') {
		super()
		if (address === '' || address.startsWith('$')) {
			address = `ws://${location.hostname}:8081`
			console.warn(`[WS] no address is defined. assuming '${address}' which may not be correct`)
		}
		this.address = address
	}

	readonly get_status = (): string => {
		if (!this._ws) return 'uninitialized'
		switch (this._ws.readyState) {
			case 0: return 'connecting'
			case 1: return 'open'
			case 2: return 'closing'
			case 3: return 'closed'
		}
		return 'unknown'
	}


	connect = async (): Promise<void> => {
		return new Promise(resolve => {
			console.log(`[WS] connecting to '${this.address}'`)
			this._ws = new WebSocket(this.address)
			this.set_connection('connecting')

			this._ws.onopen = (ev) => {
				console.log(`[WS] opened`)
				this.on_status_changed?.()
				this.set_connection('connected')
				this.on_opened?.()
				resolve()
			}

			this._ws.onclose = (ev) => {
				console.log(`[WS] closed`)
				this.on_status_changed?.()
				if (this.connection_state != 'failed')
					this.set_connection('closed')
				this.on_opened?.()
			}

			this._ws.onerror = (ev) => {
				console.error(`[WS] error`)
				this.on_status_changed?.()
				this.set_connection('failed')
				this.on_error?.(ev)
				this.disconnect()
			}

			this._ws.onmessage = (ev) => this.on_message_received?.(ev.data)
		})
	}


	disconnect = async (): Promise<void> => {
		console.log(`[WS] disconnecting`)
		this._ws?.close()
	}


	send_reliable = (message: any): void => {
		this._ws?.send(message)
	}

	send_unreliable = (message: any): void => {
		this._ws?.send(message)
	}
}
