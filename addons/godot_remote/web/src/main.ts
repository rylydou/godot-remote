import { fill_canvas } from './canvas'
import { create_remote } from './remote'
import { AUTO_SYNC_RATE, UNIT_SIZE } from './consts'
import { Control } from './control'
import { create_button } from './controls/button'
import { create_joystick } from './controls/joystick'
import { create_icon_button } from './controls/menu_button'

(async () => {
	const remote = await create_remote()
	remote.driver.on_status_change = render

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
		if (!remote.driver.is_connected) return

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
			create_icon_button(remote, () => { is_menu_open = true; update_menu() }, { center_x: 2, center_y: 2, icon: 'menu' }),
			create_icon_button(remote, () => { /* TODO: PAUSE */ }, { center_x: width - 2, center_y: 2, icon: 'pause' }),
			create_button(remote, 'a', { label: 'A', center_x: width - 4, center_y: height - 9 }),
			create_button(remote, 'b', { label: 'B', center_x: width - 9, center_y: height - 4 }),
			create_button(remote, 'x', { label: 'X', center_x: width - 9, center_y: height - 4 - 10 }),
			create_button(remote, 'y', { label: 'Y', center_x: width - 4 - 10, center_y: height - 9 }),
			create_joystick(remote, 'l', { label: 'L', radius: 4, padding: 1, center_x: 8, center_y: height - 8 }),
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
		let text = 'null'
		if (remote.driver.is_connected && remote.ping > 0) {
			text = `${remote.driver.name}: ${Math.round(remote.ping)}ms`
			ctx.globalAlpha = 0.25
		}
		else {
			text = `${remote.driver.name}: ${remote.driver.get_status()}`
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

	remote.driver.connect()
})()
