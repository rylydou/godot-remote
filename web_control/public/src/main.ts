import { fill_canvas } from './canvas.js'
import { create_client } from './client.js'
import { AUTO_SYNC_RATE, UNIT_SIZE } from './consts.js'
import { Control } from './control.js'
import { create_button } from './controls/button.js'
import { create_joystick } from './controls/joystick.js'
import { json_api } from './json_api.js'

const api = json_api
const client = create_client(api)
client.on_status_change = render
client.connect(`ws://${window.location.hostname}:8081`)

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

let width = 0
let height = 0

setInterval(() => {
	if (client.ongoing_pings > 0) return
	if (!client.is_connected) return
	client.ping_server()
}, 3000)

setInterval(() => {
	for (const control of controls) {
		if (control.auto_sync) {
			control.auto_sync()
		}
	}
}, 1000 / AUTO_SYNC_RATE)

fill_canvas(canvas, () => {
	width = ctx.canvas.width / window.devicePixelRatio / UNIT_SIZE
	height = ctx.canvas.height / window.devicePixelRatio / UNIT_SIZE

	// TODO: LAYOUT SYSTEM
	controls = [
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

	ctx.scale(window.devicePixelRatio * UNIT_SIZE, window.devicePixelRatio * UNIT_SIZE)

	ctx.fillStyle = 'white'
	ctx.strokeStyle = 'white'
	for (const control of controls) {
		if (control.render) {
			ctx.save()
			control.render(ctx)
			ctx.restore()
		}
	}

	ctx.font = 'normal 1px sans-serif'
	ctx.textAlign = 'center'
	ctx.textBaseline = 'top'

	let text = client.status
	if (client.is_connected) {
		text = `${Math.round(client.last_ping)}ms (${Math.round(client.get_avg_ping())}ms)`
	}
	ctx.fillText(text, width / 2, 1, width * .9)
}

function pointer_down(x: number, y: number, id: number) {
	x = x / UNIT_SIZE
	y = y / UNIT_SIZE

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
	x = x / UNIT_SIZE
	y = y / UNIT_SIZE

	for (const control of controls) {
		if (control.move)
			control.move(x, y, id)
	}

	render()
}

function pointer_up(x: number, y: number, id: number) {
	x = x / UNIT_SIZE
	y = y / UNIT_SIZE

	for (const control of controls) {
		if (control.up)
			control.up(x, y, id)
	}

	render()
}

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
