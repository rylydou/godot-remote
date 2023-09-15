import { Driver } from '../driver'

function create_websocket_driver(): Driver {
	let ws: WebSocket | null = null
	const driver = {
		connect(address) {
			ws = new WebSocket(address)
			ws.onmessage = (event) => {
				console.debug('[WebSocket] Message: ', event.data)
				if (driver.on_message)
					driver.on_message(event.data)
			}
			ws.onopen = (event) => {
				console.log('[WebSocket] Opened')
				if (driver.on_status_change)
					driver.on_status_change()
			}
			ws.onclose = (event) => {
				console.log('[WebSocket] Closed')
				if (driver.on_status_change)
					driver.on_status_change()
			}
			ws.onerror = (event) => {
				console.error('[WebSocket] Error: ', event)
				driver.disconnect()
			}

			if (driver.on_status_change)
				driver.on_status_change()
		},
		disconnect() {
			ws?.close()
			if (driver.on_status_change)
				driver.on_status_change()
		},
		get_status() {
			if (!ws) return 'uninitialized'
			switch (ws.readyState) {
				case WebSocket.CONNECTING: return 'connecting'
				case WebSocket.OPEN: return 'open'
				case WebSocket.CLOSED: return 'closed'
				case WebSocket.CLOSING: return 'closing'
			}
			return 'initialized'
		},

		send_reliable(message) {
			ws?.send(message)
		},
		send_unreliable(message) {
			driver.send_reliable(message)
		},
	} as Driver
	return driver
}
