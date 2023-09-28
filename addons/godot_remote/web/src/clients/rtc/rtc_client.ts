import { Client } from '../../client'
import { rtc_driver } from './rtc_driver'
import { rtc_signal_protocol } from './rtc_signal_protocol'
import ws_driver from '../ws'

export function rtc_client(): Client {
	const signaling_driver = ws_driver()
	const signal_protocol = rtc_signal_protocol()
	signaling_driver.on_message = signal_protocol.handle_message

	const rtc = rtc_driver(signal_protocol, signaling_driver)

	function update_state() {
		const was_connected = driver.is_connected
		driver.is_connected = true
		if (!signaling_driver.is_connected)
			driver.is_connected = false
		if (!rtc.is_connected)
			driver.is_connected = false

		if (was_connected != driver.is_connected) {
			if (driver.is_connected)
				driver.on_open?.()
			else
				driver.on_close?.()
			driver.on_status_change?.()
		}
	}

	signaling_driver.on_status_change = update_state
	rtc.on_status_change = update_state

	const driver: Client = {
		name: 'RTC',
		is_connected: false,

		async connect() {
			signaling_driver.connect()
			rtc.on_message = driver.on_message
			// rtc.connect()
		},
		async disconnect() {
			rtc.disconnect()
			signaling_driver.disconnect()
		},
		get_status() {
			return `WS:${signaling_driver.get_status()} RTC:${rtc.get_status()}`
		},

		send_reliable(message) {
			rtc.send_reliable(message)
		},
		send_unreliable(message) {
			rtc.send_unreliable(message)
		},
	}
	return driver
}
