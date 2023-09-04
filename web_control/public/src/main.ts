import { fill_canvas } from './canvas.js'
import { create_json_client } from './client.js'
import { UNIT_SIZE } from './consts.js'
import { Control } from './control.js'
import { create_button } from './controls/button.js'
import { create_joystick } from './controls/joystick.js'

const client = create_json_client()
client.on_status_change = render
client.connect(`ws://${window.location.hostname}:8081`)

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

let width = 0
let height = 0

fill_canvas(canvas, () => {
	width = ctx.canvas.width / window.devicePixelRatio / UNIT_SIZE
	height = ctx.canvas.height / window.devicePixelRatio / UNIT_SIZE

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
	ctx.fillText(client.status, width / 2, 1, width * .9)
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
