import { SESSION_STORAGE_KEY } from './consts.js'

export interface Client {
	ws: WebSocket | null
	ws_address: string
	auto_reconnect: boolean
	session_id: number
	connect: (ws_address: string) => void

	is_connected: boolean
	status: string
	on_status_change?: () => void

	send_session: (sid: number) => void
	send_name: (name: string) => void

	send_button: (id: string, r: boolean) => void
	send_axis: (id: string, v: number) => void
	send_joy: (id: string, x: number, y: number) => void
}

export function create_client(): Client {
	const client = {
		ws: null,
		ws_address: '',
		auto_reconnect: true,
		session_id: 0,
		connect: (ws_address) => { },

		is_connected: false,
		status: 'Connecting...',
		on_status_change: () => { },

		send_session(sid) { console.error('Undefined') },
		send_name(name) { console.error('Undefined') },
		send_button(id, is_down) { console.error('Undefined') },
		send_axis(id, value) { console.error('Undefined') },
		send_joy(id, x, y) { console.error('Undefined') },
	} as Client

	// TODO: Find a better way a generating random large integers.
	const new_session_id = Math.floor(Math.random() * 100_000)
	client.session_id = Number(sessionStorage.getItem(SESSION_STORAGE_KEY) || new_session_id)
	sessionStorage.setItem(SESSION_STORAGE_KEY, client.session_id.toString())

	client.connect = (ws_address) => {
		if (client.ws && client.ws.readyState != 3) {
			// TODO: Websocket closing error codes.
			client.ws.close(1000, 'Reconnect')
		}
		client.ws_address = ws_address
		client.ws = new WebSocket(ws_address)
		listen()
	}

	function listen() {
		client.ws.onmessage = (event) => {
			console.log('[Websocket] Message: ', event.data)
		}

		client.ws.onopen = (event) => {
			console.log('[Websocket] Opened')
			client.status = 'Connected'
			if (client.on_status_change)
				client.on_status_change()

			client.send_session(client.session_id)
		}

		client.ws.onclose = (event) => {
			console.log('[Websocket] Closed: ', { code: event.code, reason: event.reason, was_clean: event.wasClean })
			client.status = 'Disconnected'
			if (client.on_status_change)
				client.on_status_change()
		}

		client.ws.onerror = (event) => {
			console.error('[Websocket] Error: ', event)
			client.status = 'Error: ' + event.toString()

			if (client.on_status_change)
				client.on_status_change()

			if (client.auto_reconnect) {
				client.connect(client.ws_address)
			}
		}
	}

	return client
}

export function create_json_client(): Client {
	const client = create_client()

	function send(data: object) {
		client.ws.send(JSON.stringify(data))
	}

	client.send_session = (sid) => {
		this.send({
			_: 'session',
			name: sid,
		})
	}
	client.send_name = (name) => {
		this.send({
			_: 'name',
			name: name,
		})
	}

	client.send_button = (id, is_down) => {
		send({
			_: 'input',
			id: id,
			d: is_down,
		})
	}
	client.send_axis = (id, value) => {
		send({
			_: 'input',
			id: id,
			v: Math.round(value * 100) / 100,
		})
	}
	client.send_joy = (id, x, y) => {
		send({
			_: 'input',
			id: id,
			x: Math.round(x * 100) / 100,
			y: Math.round(y * 100) / 100,
		})
	}

	return client
}
