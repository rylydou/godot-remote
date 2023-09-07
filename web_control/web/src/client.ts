import { API, ApiConstructor } from './api'
import { SESSION_STORAGE_KEY } from './consts'

export interface Client {
	api: API

	readonly send_packet: (data: any) => void

	ws: WebSocket | null
	ws_address: string
	auto_reconnect: boolean
	readonly connect: (ws_address: string) => void
	is_connected: boolean
	status: string
	on_status_change?: () => void

	session_id: number

	ongoing_pings: number
	last_pong_timestamp: number
	last_ping: number
	ping_sum: number
	ping_count: number
	get_avg_ping: () => number

	ping_server: () => void
}

export function create_client(create_api: ApiConstructor): Client {

	const client = {
		api: create_api((data) => client.send_packet(data)),

		send_packet(data) {
			if (!client.ws) return
			client.ws.send(data)
		},

		ws: null,
		ws_address: '',
		auto_reconnect: true,
		is_connected: false,
		status: 'Connecting...',
		connect(ws_address) {
			if (client.ws && client.ws.readyState != 3) {
				// TODO: WEBSOCKET ERROR CODES
				client.ws.close(1000, 'Automatic close due to error.')
			}
			client.ws_address = ws_address
			client.ws = new WebSocket(ws_address)
			listen()
		},
		on_status_change: () => { },

		session_id: 0,

		ongoing_pings: 0,
		last_pong_timestamp: 0,
		last_ping: 0,
		ping_sum: 0,
		ping_count: 0,
		get_avg_ping: () => client.ping_sum / Math.max(client.ping_count, 1),

		ping_server() {
			client.ongoing_pings++
			client.api.send_ping(Date.now())
		},
	} as Client

	// TODO: Find a better way a generating random large integers.
	const new_session_id = Math.floor(Math.random() * 100_000)
	client.session_id = Number(sessionStorage.getItem(SESSION_STORAGE_KEY) || new_session_id)
	sessionStorage.setItem(SESSION_STORAGE_KEY, client.session_id.toString())

	client.api.receive_ping = (sts) => {
		client.api.send_pong(sts, Date.now())
	}

	client.api.receive_pong = (sts, rts) => {
		const now = Date.now()
		const ping = now - sts
		client.ongoing_pings--
		client.last_ping = ping
		client.last_pong_timestamp = now
		client.ping_sum += ping
		client.ping_count++
	}

	function listen() {
		if (!client.ws) {
			console.error('[Websocket] Cannot listen to WebSocket client. One has not been made made.')
			return
		}

		client.ws.onmessage = (event) => {
			console.debug('[WebSocket] Message: ', event.data)
			client.api.handle_packet(event.data)
		}

		client.ws.onopen = (event) => {
			console.log('[WebSocket] Opened')
			client.status = 'Connected'
			client.is_connected = true
			if (client.on_status_change)
				client.on_status_change()

			client.api.send_session(client.session_id)
		}

		client.ws.onclose = (event) => {
			console.log('[WebSocket] Closed: ', { code: event.code, reason: event.reason, was_clean: event.wasClean })
			client.status = 'Disconnected'
			client.is_connected = false
			if (client.on_status_change)
				client.on_status_change()
		}

		client.ws.onerror = (event) => {
			console.error('[WebSocket] Error: ', event)
			client.status = 'Error: ' + event.toString()
			client.is_connected = false

			if (client.on_status_change)
				client.on_status_change()

			if (client.auto_reconnect) {
				client.connect(client.ws_address)
			}
		}
	}

	return client
}
