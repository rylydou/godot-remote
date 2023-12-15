import { Context, Plugin } from '../core'

import { Config, Driver, RemoteProtocol, Widget } from '.'
import { RTCDriver } from './drivers/rtc'
import { WSDriver } from './drivers/ws'
import { BinaryProtocol, JSONProtocol } from './protocols'
import { Button, Joystick, MenuButton } from './widgets'


export class Remote {
	readonly plugin: Plugin

	readonly driver_type: string = '$_DRIVER_$'
	readonly protocol_type: string = '$_PROTOCOL_$'


	readonly protocol: RemoteProtocol
	readonly driver: Driver


	widgets: Widget[] = []


	constructor(plugin: Plugin) {
		this.plugin = plugin

		if (this.driver_type.startsWith('$')) {
			this.driver_type = 'WS'
			plugin.warn(`no driver is defined - assuming '${this.driver_type}' which may not be correct`)
		}

		if (this.protocol_type.startsWith('$')) {
			this.protocol_type = 'JSON'
			plugin.warn(`no protocol is defined - assuming '${this.protocol_type}' which may not be correct`)
		}

		switch (this.driver_type) {
			default: throw new Error('[remote] unknown driver type: ' + this.driver_type)

			case 'WS':
				this.driver = new WSDriver()
				break
			case 'RTC':
				this.driver = new RTCDriver()
				break
		}

		switch (this.protocol_type) {
			default: throw new Error('[remote] unknown protocol type: ' + this.protocol_type)

			case 'JSON':
				this.protocol = new JSONProtocol()
				break

			case 'BIN':
				this.protocol = new BinaryProtocol()
				break
		}

		this.plugin.resize = (ctx) => this.resize(ctx)
		this.plugin.draw = (ctx) => this.draw(ctx)
		this.plugin.pointer_down = (pid, px, py) => this.pointer_down(pid, px, py)
		this.plugin.pointer_move = (pid, px, py) => this.pointer_move(pid, px, py)
		this.plugin.pointer_up = (pid, px, py) => this.pointer_up(pid, px, py)

		this.trace = plugin.trace
		this.debug = plugin.debug
		this.log = plugin.log
		this.warn = plugin.warn
		this.error = plugin.error

		this.queue_redraw = () => plugin.engine.queue_redraw()

		window.setTimeout(() => {
			this.tick()
		}, 1000 / Config.TICK_RATE)
	}


	readonly trace: (...data: any[]) => void
	readonly debug: (...data: any[]) => void
	readonly log: (...data: any[]) => void
	readonly warn: (...data: any[]) => void
	readonly error: (...data: any[]) => void

	readonly queue_redraw: () => void


	resize(ctx: Context): void {
		this.widgets = [
			new MenuButton(this, 'menu', { icon: 'menu', cx: 2, cy: 2 }),
			new MenuButton(this, 'pause', { icon: 'pause', cx: ctx.w - 2, cy: 2 }),
			new Joystick(this, 'l', { label: 'L', cx: 8, cy: ctx.h - 8, r: 4, pad: 1 }),
			new Button(this, 'a', { label: 'A', cx: ctx.w - 4, cy: ctx.h - 9 }),
			new Button(this, 'b', { label: 'B', cx: ctx.w - 9, cy: ctx.h - 4 }),
			new Button(this, 'x', { label: 'X', cx: ctx.w - 9, cy: ctx.h - 14 }),
			new Button(this, 'y', { label: 'Y', cx: ctx.w - 14, cy: ctx.h - 9 }),
		]
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
