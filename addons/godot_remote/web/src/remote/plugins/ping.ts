import { Config, RemotePlugin, } from '..'
import { Context, Monitor, } from '../../core'


export class Ping {
	readonly plugin: RemotePlugin


	sent_pings = 0
	received_pings = 0
	ongoing_pings = 0

	monitor = new Monitor()
	show_text = true
	show_graph = true


	constructor(plugin: RemotePlugin) {
		this.plugin = plugin

		this.plugin.engine.protocol.on_pong = (sts) => {
			this.received_pings++
			this.ongoing_pings--

			const ping_ms = Date.now() - sts
			this.monitor.log(ping_ms)

			plugin.draw = (ctx) => this.draw(ctx)

			if (this.show_text || this.show_graph) {
				plugin.engine.queue_redraw()
			}
		}

		setInterval(() => {
			if (plugin.engine.driver.connection_state != 'connected') return

			this.send_ping()
		}, Config.PING_BTW_MS)
	}


	send_ping() {
		const sts = Date.now()
		const payload = this.plugin.engine.protocol.ping(sts)
		this.plugin.engine.driver.send_unreliable(payload)
		this.sent_pings++
		this.ongoing_pings++
	}


	draw(ctx: Context) {
		if (this.plugin.engine.driver.connection_state != 'connected') return

		if (this.show_graph) {
			ctx.save()
			ctx.resetTransform()
			ctx.translate(ctx.canvas.width / 2 - this.monitor.size, 0)
			ctx.fillStyle = 'rgb(64 64 64)'
			this.monitor.draw(ctx, 0, 2, 1)
			ctx.restore()
		}

		if (this.show_text) {
			ctx.textBaseline = 'top'
			ctx.textAlign = 'center'
			ctx.font = 'bold 1px monospace'
			ctx.fillStyle = 'rgb(128 128 128)'
			ctx.fillText(`${this.monitor.current}ms ${Math.floor(this.received_pings / this.sent_pings * 100)}%`, ctx.w / 2, 1)
		}
	}
}
