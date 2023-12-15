import { Widget } from '.'
import { Context, Plugin } from '../core'
import { Button, Joystick, MenuButton } from './widgets'


export class Remote {
	readonly plugin: Plugin


	widgets: Widget[] = []


	constructor(plugin: Plugin) {
		this.plugin = plugin

		this.plugin.resize = this.resize
		this.plugin.draw = this.draw
		this.plugin.pointer_down = this.pointer_down
		this.plugin.pointer_move = this.pointer_move
		this.plugin.pointer_up = this.pointer_up

		this.trace = plugin.trace
		this.debug = plugin.debug
		this.log = plugin.log
		this.warn = plugin.warn
		this.error = plugin.error

		this.queue_redraw = plugin.engine.queue_redraw
	}


	trace: (...data: any[]) => void
	debug: (...data: any[]) => void
	log: (...data: any[]) => void
	warn: (...data: any[]) => void
	error: (...data: any[]) => void

	queue_redraw: () => void


	resize = (ctx: Context): void => {
		this.widgets = [
			new MenuButton(this, { icon: 'menu', cx: 2, cy: 2 }),
			new MenuButton(this, { icon: 'pause', cx: ctx.w - 2, cy: 2 }),
			new Joystick(this, { label: 'L', cx: 8, cy: ctx.h - 8, r: 4, pad: 1 }),
			new Button(this, { label: 'A', cx: ctx.w - 4, cy: ctx.h - 9 }),
			new Button(this, { label: 'B', cx: ctx.w - 9, cy: ctx.h - 4 }),
			new Button(this, { label: 'X', cx: ctx.w - 9, cy: ctx.h - 14 }),
			new Button(this, { label: 'Y', cx: ctx.w - 14, cy: ctx.h - 9 }),
		]
	}


	draw = (ctx: Context): void => {
		ctx.fillStyle = 'white'
		ctx.strokeStyle = 'white'

		for (const widget of this.widgets) {
			ctx.save()
			widget.draw(ctx)
			ctx.restore()
		}
	}

	pointer_down = (pid: number, px: number, py: number): boolean => {
		for (const widget of this.widgets) {
			const is_handled = widget.down(pid, px, py)
			if (is_handled) return true
		}
		return false
	}

	pointer_move = (pid: number, px: number, py: number): void => {
		for (const widget of this.widgets) {
			widget.move(pid, px, py)
		}
	}

	pointer_up = (pid: number, px: number, py: number): void => {
		for (const widget of this.widgets) {
			widget.up(pid, px, py)
		}
	}
}
