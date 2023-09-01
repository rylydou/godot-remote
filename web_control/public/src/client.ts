export interface Client {
	ws: WebSocket
	ws_address: String

	is_connected: boolean
	status: string
	on_status_change?: () => void

	send_name: (name: string) => void
	send_button: (id: string, r: boolean) => void
	send_axis: (id: string, v: number) => void
	send_joy: (id: string, x: number, y: number) => void
}

export function create_client(ws_address: string): Client {
	const client = {
		ws_address: ws_address,
		ws: new WebSocket(ws_address),

		is_connected: false,
		status: 'Connecting...',
		on_status_change: () => { },

		send_name(name) {
			console.error('Undefined')
		},
		send_button(id, is_down) {
			console.error('Undefined')
		},
		send_axis(id, value) {
			console.error('Undefined')
		},
		send_joy(id, x, y) {
			console.error('Undefined')

		},
	}

	client.ws.onopen = (event) => {
		client.status = 'Connected'
		if (client.on_status_change)
			client.on_status_change()
	}

	client.ws.onclose = (event) => {
		client.status = 'Disconnected'
		if (client.on_status_change)
			client.on_status_change()
	}

	client.ws.onerror = (event) => {
		console.error('[Websocket] Error: ', event)
		client.status = 'Error: ' + event.toString()

		if (client.on_status_change)
			client.on_status_change()
	}

	return client
}

export function create_json_client(ws_address: string): Client {
	const client = create_client(ws_address)

	function send(data: object) {
		client.ws.send(JSON.stringify(data))
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
