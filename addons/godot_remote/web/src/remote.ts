import { Protocol } from './protocol'
import { PING_TIME, SESSION_STORAGE_KEY } from './consts'
import { Client } from './client'

export interface Remote {
	readonly protocol: Protocol
	readonly driver: Client

	auto_reconnect: boolean
	// is_connected: boolean
	status: string
	on_status_change?: () => void

	session_id: number

	sent_pings: number
	received_pings: number
	pong_timestamp: number
	ping: number

	ping_server: () => void
}

export async function create_remote() {
	let client_type = '$_CLIENT_$'
	let protocol_type = '$_PROTOCOL_$'
	console.log(client_type)
	if (client_type.startsWith('$')) {
		client_type = 'RTC'
		console.warn(`No client defined! Assuming ${client_type} which may not be correct.`)
	}
	if (protocol_type.startsWith('$')) {
		protocol_type = 'JSON'
		console.warn(`No protocol defined! Assuming ${protocol_type} which may not be correct.`)
	}
	console.log('Driver:', client_type)
	console.log('Protocol:', protocol_type)

	let create_client: () => Client = () => { throw new Error('Client constructor not found.') }
	let create_protocol: () => Protocol = () => { throw new Error('Protocol constructor not found.') }
	switch (client_type) {
		case 'WS':
			create_client = (await import('./clients/ws')).default
			break
		case 'RTC':
			create_client = (await import('./clients/rtc')).default
			break
	}
	switch (protocol_type) {
		case 'JSON':
			create_protocol = (await import('./protocols/json')).default
			break
	}
	const driver = create_client()
	const protocol = create_protocol()
	driver.on_message = protocol.handle_message

	protocol.on_ping = (sts) => {
		driver.send_reliable(client.protocol.pong(sts, Date.now()))
	}

	protocol.on_pong = (sts, rts) => {
		const now = Date.now()
		const ping = now - sts
		client.ping = ping
		client.pong_timestamp = now
		client.received_pings++
		client.on_status_change?.()
	}

	driver.on_open = async () => {
		console.log('[Client] Connected.')
		client.sent_pings = 0
		client.received_pings = 0
		client.ping = 0
		client.pong_timestamp = 0

		await new Promise<void>((resolve) => setTimeout(resolve, 2000))

		client.driver.send_reliable(client.protocol.session(client.session_id))
	}

	driver.on_close = () => {
		setTimeout(() => {
			if (client.auto_reconnect) {
				console.log('[Client] Auto reconnecting due to disconnect.')
				client.driver.connect()
			}
		}, 5000)
	}

	setInterval(() => {
		if (!driver.is_connected) return
		// if (client.ongoing_pings > 0) return

		client.ping_server()
	}, PING_TIME)

	const new_session_id = Math.floor(Math.random() * 899_999) + 100_000
	const session_id = Number(sessionStorage.getItem(SESSION_STORAGE_KEY) || new_session_id)
	sessionStorage.setItem(SESSION_STORAGE_KEY, session_id.toString())
	document.getElementById('menu_session_id')!.textContent = '#' + session_id

	const client: Remote = {
		protocol,
		driver,

		auto_reconnect: false,
		// is_connected: false,
		status: 'Connecting...',

		session_id,

		sent_pings: 0,
		received_pings: 0,
		pong_timestamp: 0,
		ping: 0,

		ping_server() {
			client.sent_pings++
			driver.send_unreliable(client.protocol.ping(Date.now()))
		},
	}

	return client
}
