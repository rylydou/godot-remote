import { RemotePlugin } from '..'


export const debug = (plugin: RemotePlugin): void => {
	plugin.remote.driver.on_status_changed = () => plugin.engine.queue_redraw()

	plugin.draw = (ctx) => {
		let texts: string[] = plugin.engine.screen_log.slice()

		// if (plugin.engine.driver.connection_state != 'connected') {
		// 	texts.push(plugin.engine.driver.name)
		// 	texts.push(plugin.engine.driver.connection_state)
		// 	// texts.push(plugin.engine.driver.get_status())
		// }

		if (texts.length == 0) return

		ctx.textBaseline = 'top'
		ctx.textAlign = 'center'
		ctx.font = 'bold 1px monospace'
		ctx.fillStyle = 'white'
		ctx.fillText(texts.join(' '), ctx.w / 2, 2.5, ctx.w * .75)
	}
}
