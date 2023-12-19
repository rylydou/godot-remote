import { RemotePlugin, Widget } from '..'
import { Button, Joystick, MenuButton } from '../widgets'


export const controls = (plugin: RemotePlugin): void => {
	let widgets: Widget[] = []


	plugin.resize = (ctx) => {
		widgets = [
			new MenuButton(plugin.remote, () => { window.remote_open_menu() }, { icon: 'menu', cx: 2, cy: 2, }),
			new MenuButton(plugin.remote, () => { }, { icon: 'pause', cx: ctx.w - 2, cy: 2, }),
			new Joystick(plugin.remote, 'l', { label: 'L', cx: 8, cy: ctx.h - 8, }),
			new Button(plugin.remote, 'a', { label: 'A', cx: ctx.w - 4, cy: ctx.h - 9, }),
			new Button(plugin.remote, 'b', { label: 'B', cx: ctx.w - 9, cy: ctx.h - 4, }),
			new Button(plugin.remote, 'x', { label: 'X', cx: ctx.w - 9, cy: ctx.h - 14, }),
			new Button(plugin.remote, 'y', { label: 'Y', cx: ctx.w - 14, cy: ctx.h - 9, }),
		]

		for (const widget of widgets) {
			widget.sync()
		}
	}


	plugin.tick = () => {
		for (const widget of widgets) {
			widget.tick()
		}
	}


	plugin.draw = (ctx) => {
		const is_connected = plugin.remote.driver.connection_state == 'connected'

		ctx.fillStyle = is_connected ? 'white' : 'rgb(64 64 64)'
		ctx.strokeStyle = is_connected ? 'white' : 'rgb(64 64 64)'

		for (const widget of widgets) {
			ctx.save()
			widget.draw(ctx)
			ctx.restore()
		}
	}


	plugin.pointer_down = (pid, px, py) => {
		for (const widget of widgets) {
			const is_handled = widget.down(pid, px, py)
			if (is_handled) return true
		}
		return false
	}


	plugin.pointer_move = (pid, px, py) => {
		for (const widget of widgets) {
			widget.move(pid, px, py)
		}
		return false
	}


	plugin.pointer_up = (pid, px, py) => {
		for (const widget of widgets) {
			widget.up(pid, px, py)
		}
		return false
	}
}
