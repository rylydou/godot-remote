import { Config, RemotePlugin, } from '..'
import { Context, Monitor, } from '../../core'


type PingView = 'hidden' | 'number' | 'graph'


export class Ping {
	readonly plugin: RemotePlugin


	sent_pings = 0
	received_pings = 0
	ongoing_pings = 0

	view: PingView = 'graph'
	monitor = new Monitor()


	constructor(plugin: RemotePlugin) {
		this.plugin = plugin

		this.plugin.engine.protocol.on_pong = (sts, rts) => {
			this.received_pings += 1
			this.ongoing_pings -= 1

			const ping_ms = Date.now() - sts
			this.monitor.log(ping_ms)

			plugin.draw = (ctx) => this.draw(ctx)

			if (this.view != 'hidden') {
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
	}


	draw(ctx: Context) {
		switch (this.view) {
			case 'graph':
				ctx.save()
				ctx.resetTransform()
				ctx.translate(ctx.canvas.width / 2 - this.monitor.size / 2, 0)
				// ctx.fillStyle = 'darkgray'
				// ctx.translate(4, 4)
				this.monitor.draw(ctx, 0, 1, -100)
				ctx.fillStyle = 'red'
				ctx.fillRect(2, 2, 5, 5)
				ctx.restore()

				ctx.textBaseline = 'top'
				ctx.textAlign = 'center'
				ctx.font = 'bold 1px monospace'
				ctx.fillStyle = 'white'
				ctx.fillText(`${this.monitor.current}ms`, ctx.w / 2, 1)
				break
		}
	}
}
