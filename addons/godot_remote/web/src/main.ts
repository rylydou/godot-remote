import { fill_canvas } from './canvas'
import { create_client } from './client'
import { AUTO_SYNC_RATE, PING_TIME, UNIT_SIZE } from './consts'
import { Control } from './control'
import { create_button } from './controls/button'
import { create_joystick } from './controls/joystick'
import { create_icon_button } from './controls/menu_button'
import { create_json_api } from './apis/json_api'
import { Driver } from './driver'

(async () => {
	const driver_type: string = '$_DRIVER_$'
	console.log('[Driver] ', driver_type)
	let create_driver: () => Driver = () => { throw new Error('Driver constructor not found.') }
	switch (driver_type) {
		case 'WebSocket':
			create_driver = (await import('./drivers/websocket_driver')).default
			break
		case 'WebRTC':
			create_driver = (await import('./drivers/webrtc_driver')).default
			break
		default:
			console.error('FAIL! [Driver] Unknown driver type: ', driver_type)
			return
	}
	const driver = create_driver()
	const api = create_json_api(driver)
	const client = create_client(api)
	client.api.driver.on_status_change = () => {
		document.getElementById('menu-status')!.textContent = client.api.driver.get_status()
		render()
	}

	const canvas = document.getElementById('canvas') as HTMLCanvasElement
	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
	const menu_element = document.getElementById('menu') as HTMLDivElement

	let is_menu_open = false

	let width = 0
	let height = 0

	function transform_point(x: number, y: number): [number, number] {
		x = x / UNIT_SIZE
		y = y / UNIT_SIZE
		return [x, y]
	}

	function scale_factor(): number {
		return window.devicePixelRatio * UNIT_SIZE
		return UNIT_SIZE
	}

	setInterval(() => {
		if (!client.is_connected) return

		if (client.ongoing_pings > 0) return
		if (!client.is_connected) return
		client.ping_server()
	}, PING_TIME)

	setInterval(() => {
		if (!client.is_connected) return

		for (const control of controls) {
			if (control.sync)
				control.sync(false)
		}
	}, 1000 / AUTO_SYNC_RATE)

	fill_canvas(canvas, () => {
		width = ctx.canvas.width / scale_factor()
		height = ctx.canvas.height / scale_factor()

		// TODO: LAYOUT SYSTEM
		controls = [
			create_icon_button(client, () => { is_menu_open = true; update_menu() }, { center_x: 2, center_y: 2, icon: 'menu' }),
			create_icon_button(client, () => { /* TODO: PAUSE */ }, { center_x: width - 2, center_y: 2, icon: 'pause' }),
			create_button(client, 'a', { label: 'A', center_x: width - 4, center_y: height - 9 }),
			create_button(client, 'b', { label: 'B', center_x: width - 9, center_y: height - 4 }),
			create_button(client, 'x', { label: 'X', center_x: width - 9, center_y: height - 4 - 10 }),
			create_button(client, 'y', { label: 'Y', center_x: width - 4 - 10, center_y: height - 9 }),
			create_joystick(client, 'l', { label: 'L', radius: 4, padding: 1, center_x: 8, center_y: height - 8 }),
		]

		render()
	})

	let controls: Control[] = []

	function render() {
		ctx.resetTransform()
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

		ctx.scale(scale_factor(), scale_factor())

		ctx.fillStyle = 'white'
		ctx.strokeStyle = 'white'

		for (const control of controls) {
			if (control.render) {
				ctx.save()
				control.render(ctx)
				ctx.restore()
			}
		}

		ctx.save()
		render_status()
		ctx.restore()
	}

	function render_status(): void {
		let text = client.api.driver.get_status()
		if (client.is_connected && client.ping_count > 0) {
			text = `${Math.round(client.last_ping)}ms (${Math.round(client.get_avg_ping())}ms)`
			ctx.globalAlpha = 0.25
		}
		ctx.font = 'bold 1px sans-serif'
		ctx.textAlign = 'center'
		ctx.textBaseline = 'top'
		ctx.fillText(text, width / 2, 1, width * .9)
	}

	function update_menu(): void {
		if (is_menu_open) {
			menu_element.classList.add('open')
			canvas.classList.add('open')
		}
		else {
			menu_element.classList.remove('open')
			canvas.classList.remove('open')
		}
		// render()
	}

	function pointer_down(x: number, y: number, id: number) {
		if (is_menu_open) return

		[x, y] = transform_point(x, y)

		for (const control of controls) {
			if (control.down)
				control.down(x, y, id)
		}

		for (const control of controls) {
			if (control.move)
				control.move(x, y, id)
		}

		render()
	}

	function pointer_move(x: number, y: number, id: number) {
		if (is_menu_open) return

		[x, y] = transform_point(x, y)

		for (const control of controls) {
			if (control.move)
				control.move(x, y, id)
		}

		render()
	}

	function pointer_up(x: number, y: number, id: number) {
		if (is_menu_open) return

		[x, y] = transform_point(x, y)

		for (const control of controls) {
			if (control.up)
				control.up(x, y, id)
		}

		render()
	}

	canvas.addEventListener('pointerdown', (ev) => {
		ev.preventDefault()
		if (is_menu_open) {
			is_menu_open = false
			update_menu()
		}
	})
	window.addEventListener('pointerdown', (ev) => {
		ev.preventDefault()
		pointer_down(ev.x, ev.y, ev.pointerId)
	})

	window.addEventListener('pointerup', (ev) => {
		ev.preventDefault()
		pointer_up(ev.x, ev.y, ev.pointerId)
	})

	window.addEventListener('pointermove', (ev) => {
		ev.preventDefault()
		pointer_move(ev.x, ev.y, ev.pointerId)
	})

	canvas.addEventListener('touchstart', (ev) => ev.preventDefault())
	// canvas.addEventListener('touchmove', (ev) =>ev.preventDefault())

	document.getElementById('menu-close')?.addEventListener('click', (event) => {
		is_menu_open = false
		update_menu()
	})

	client.connect(`ws://${location.hostname}:$_DRIVER_PORT_$`)
})()
