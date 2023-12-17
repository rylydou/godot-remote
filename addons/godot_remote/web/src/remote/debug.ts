import { Remote, RemotePlugin } from '.'
import { Context } from '../core'


export class Debug {
	readonly plugin: RemotePlugin


	constructor(plugin: RemotePlugin) {
		this.plugin = plugin

		plugin.draw = this.draw

		plugin.engine.driver.on_status_changed = () => plugin.engine.queue_redraw()
	}


	draw = (ctx: Context): void => {
		let texts: string[] = this.plugin.engine.screen_log.slice()

		if (this.plugin.engine.driver.connection_state != 'connected') {
			texts.push(this.plugin.engine.driver.name)
			texts.push(this.plugin.engine.driver.connection_state)
			// texts.push(this.plugin.engine.driver.get_status())
		}

		if (texts.length == 0) return

		ctx.textBaseline = 'top'
		ctx.textAlign = 'center'
		ctx.font = 'bold 1px monospace'
		ctx.fillStyle = 'white'
		ctx.fillText(texts.join(' '), ctx.w / 2, 2.5, ctx.w * .75)
	}
}
