import { Config, RemotePlugin, Widget } from '..'
import { Context } from '../../core'
import { Button, Joystick, MenuButton } from '../widgets'


export class Controls {
	readonly plugin: RemotePlugin


	widgets: Widget[] = []


	constructor(plugin: RemotePlugin) {
		this.plugin = plugin

		this.plugin.resize = (ctx) => this.resize(ctx)
		this.plugin.draw = (ctx) => this.draw(ctx)
		this.plugin.pointer_down = (pid, px, py) => this.pointer_down(pid, px, py)
		this.plugin.pointer_move = (pid, px, py) => this.pointer_move(pid, px, py)
		this.plugin.pointer_up = (pid, px, py) => this.pointer_up(pid, px, py)

		this.plugin.tick = () => this.tick()
	}


	resize(ctx: Context): void {
		this.widgets = [
			new MenuButton(this.plugin.engine, { icon: 'menu', cx: 2, cy: 2 }),
			new MenuButton(this.plugin.engine, { icon: 'pause', cx: ctx.w - 2, cy: 2 }),
			new Joystick(this.plugin.engine, 'l', { label: 'L', cx: 8, cy: ctx.h - 8, r: 4, pad: 1 }),
			new Button(this.plugin.engine, 'a', { label: 'A', cx: ctx.w - 4, cy: ctx.h - 9 }),
			new Button(this.plugin.engine, 'b', { label: 'B', cx: ctx.w - 9, cy: ctx.h - 4 }),
			new Button(this.plugin.engine, 'x', { label: 'X', cx: ctx.w - 9, cy: ctx.h - 14 }),
			new Button(this.plugin.engine, 'y', { label: 'Y', cx: ctx.w - 14, cy: ctx.h - 9 }),
		]

		for (const widget of this.widgets) {
			widget.sync()
		}
	}


	tick(): void {
		for (const widget of this.widgets) {
			widget.tick()
		}
	}


	draw(ctx: Context): void {
		ctx.fillStyle = 'white'
		ctx.strokeStyle = 'white'

		for (const widget of this.widgets) {
			ctx.save()
			widget.draw(ctx)
			ctx.restore()
		}
	}


	pointer_down(pid: number, px: number, py: number): boolean {
		for (const widget of this.widgets) {
			const is_handled = widget.down(pid, px, py)
			if (is_handled) return true
		}
		return false
	}

	pointer_move(pid: number, px: number, py: number): void {
		for (const widget of this.widgets) {
			widget.move(pid, px, py)
		}
	}

	pointer_up(pid: number, px: number, py: number): void {
		for (const widget of this.widgets) {
			widget.up(pid, px, py)
		}
	}
}
