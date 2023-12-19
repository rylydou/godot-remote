import { Config, RemotePlugin, } from '..'
import { Monitor } from '../../core'
import { CONNECTION_DROPPED_MS } from '../config'


export const ping = (plugin: RemotePlugin): void => {
	let is_connected = false

	let sent_pings = 0
	let received_pings = 0
	let ongoing_pings = 0
	let last_ping_receive_time = Date.now()

	let monitor = new Monitor()
	let show_text = true
	let show_graph = true


	const send_ping = () => {
		const sts = Date.now()
		const payload = plugin.remote.protocol.ping(sts)
		plugin.remote.driver.send_unreliable(payload)
		sent_pings++
		ongoing_pings++
	}


	plugin.connected = () => {
		last_ping_receive_time = Date.now()
		is_connected = true
	}

	plugin.draw = (ctx) => {
		if (plugin.remote.driver.connection_state != 'connected') return
		if (plugin.remote.is_connection_dropped) return

		if (show_graph) {
			ctx.save()
			ctx.resetTransform()
			ctx.translate(ctx.canvas.width / 2 - monitor.size, 0)
			ctx.fillStyle = 'rgb(64 64 64)'
			monitor.draw(ctx, 0, 2, 1)
			ctx.restore()
		}

		if (show_text) {
			ctx.textBaseline = 'top'
			ctx.textAlign = 'center'
			ctx.font = 'bold 1px monospace'
			ctx.fillStyle = 'rgb(128 128 128)'
			ctx.fillText(`${monitor.current}ms ${Math.floor(received_pings / sent_pings * 100)}%`, ctx.w / 2, 1)
		}
	}


	plugin.remote.protocol.on_pong = (sts) => {
		received_pings++
		ongoing_pings--
		last_ping_receive_time = Date.now()

		const ping_ms = Date.now() - sts
		monitor.log(ping_ms)

		plugin.remote.set_connection_dropped(false)

		if (show_text || show_graph) {
			plugin.remote.queue_redraw()
		}
	}


	// ----- Init -----
	setInterval(() => {
		if (!is_connected) return

		send_ping()

		const delta = Date.now() - last_ping_receive_time
		if (delta > CONNECTION_DROPPED_MS) {
			plugin.remote.set_connection_dropped(true)
			plugin.remote.queue_redraw()
		}
	}, Config.PING_BTW_MS)
}


export class Ping {

}
