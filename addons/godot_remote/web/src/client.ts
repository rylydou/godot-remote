import { API } from './api'
import { SESSION_STORAGE_KEY } from './consts'

export interface Client {
	api: API

	readonly send_packet: (data: any) => void

	reconnect_address: string
	auto_reconnect: boolean
	readonly connect: (address: string) => void
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

export function create_client(api: API): Client {
	const client = {
		api: api,

		reconnect_address: '',
		auto_reconnect: true,
		is_connected: false,
		status: 'Connecting...',
		connect(address) {
			client.reconnect_address = address
			api.driver.connect(address)
		},

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

	client.api.driver.on_open = () => {
		console.log('[Client] Connecting. Sending session id.')
		api.send_session(client.session_id)
		client.is_connected = true
	}

	client.api.driver.on_close = () => {
		client.is_connected = false

		if (client.auto_reconnect) {
			console.log('[Client] Auto reconnecting due to disconnect.')
			client.api.driver.connect(client.reconnect_address)
		}
	}

	return client
}
