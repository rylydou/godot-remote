import { Remote } from '.'
import { Context, Plugin } from '../core'


export class Debug {
	readonly plugin: Plugin
	readonly remote: Remote


	constructor(plugin: Plugin, remote: Remote) {
		this.plugin = plugin
		this.remote = remote

		plugin.draw = this.draw
	}


	draw = (ctx: Context): void => {
		ctx.textBaseline = 'top'
		ctx.textAlign = 'center'
		ctx.font = 'bold 1px monospace'
		ctx.fillStyle = 'white'
		ctx.fillText('debug text', ctx.w / 2, 1, ctx.w * .75)
	}
}
