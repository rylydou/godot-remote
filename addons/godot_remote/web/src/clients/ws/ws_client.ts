import { Client } from '../../client'

export function ws_client(): Client {
	let ws: WebSocket | null = null
	const driver: Client = {
		name: 'WebSocket',
		is_connected: false,

		async connect() {
			let address = '$_WS_ADDRESS_$'
			if (address.startsWith('$')) {
				address = `ws://${location.hostname}:8081`
			}
			console.log('[WebSocket] Connecting to:', address)
			ws = new WebSocket(address)

			ws.onmessage = (event) => {
				console.debug('[WebSocket] Message: ', event.data)

				driver.on_message?.(event.data)
			}
			ws.onopen = (event) => {
				console.log('[WebSocket] Opened')

				driver.is_connected = true

				driver.on_open?.()
				driver.on_status_change?.()
			}
			ws.onclose = (event) => {
				console.log('[WebSocket] Closed')
				driver.is_connected = false

				driver.on_close?.()
				driver.on_status_change?.()
			}
			ws.onerror = (event) => {
				// console.error('[WebSocket] Error: ', event)
				driver.disconnect()

				driver.on_error?.(event)
			}

			driver.on_status_change?.()
		},
		async disconnect() {
			console.log('[WebSocket] Disconnecting.')
			ws?.close()
			driver.on_status_change?.()
		},
		get_status() {
			if (!ws) return 'Initializing...'
			switch (ws.readyState) {
				case WebSocket.CONNECTING: return 'Connecting...'
				case WebSocket.OPEN: return 'Connected'
				case WebSocket.CLOSED: return 'Disconnected'
				case WebSocket.CLOSING: return 'Disconnecting...'
			}
			return 'Initialized'
		},

		send_reliable(message) {
			ws?.send(message)
		},
		send_unreliable(message) {
			ws?.send(message)
		},
	}
	return driver
}
