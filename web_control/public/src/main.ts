import { fill_canvas } from './canvas.js'
import { create_json_client } from './client.js'
import { Control } from './control.js'
import { create_button } from './controls/button.js'
import { create_joystick } from './controls/joystick.js'

console.log('Connecting WebSocket')
const client = create_json_client(`ws://${window.location.hostname}:8081`)
client.on_status_change = render

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

fill_canvas(canvas, () => {
	const width = ctx.canvas.width / window.devicePixelRatio
	const height = ctx.canvas.height / window.devicePixelRatio

	// controls = [
	// 	create_joystick(client, 'l', { label: 'L', radius: 80, padding: 48, center_x: width / 4, center_y: height / 2 }),
	// 	create_button(client, 'a', { label: 'A', center_x: width / 4 * 3 + 80, center_y: height / 2 }),
	// 	create_button(client, 'b', { label: 'B', center_x: width / 4 * 3, center_y: height / 2 + 80 }),
	// 	create_button(client, 'x', { label: 'X', center_x: width / 4 * 3, center_y: height / 2 - 80 }),
	// 	create_button(client, 'y', { label: 'Y', center_x: width / 4 * 3 - 80, center_y: height / 2 }),
	// ]

	controls = [
		create_joystick(client, 'l', { label: 'L', radius: 80, padding: 48, center_x: width / 4, center_y: height / 2 }),
		create_joystick(client, 'r', { label: 'R', radius: 64, padding: 16, center_x: width / 4 * 3 - 40, center_y: height / 2 - 40 }),
		create_button(client, 'a', { label: 'A', center_x: width / 4 * 3 + 100, center_y: height / 2 }),
		create_button(client, 'b', { label: 'B', center_x: width / 4 * 3, center_y: height / 2 + 100 }),
	]

	render()
})

let controls: Control[] = []

function render() {
	const width = ctx.canvas.width / window.devicePixelRatio
	const height = ctx.canvas.height / window.devicePixelRatio

	ctx.resetTransform()
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

	ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

	for (const control of controls) {
		if (control.render) {
			ctx.save()
			control.render(ctx)
			ctx.restore()
		}
	}

	ctx.font = 'normal 16px sans-serif'
	ctx.textAlign = 'center'
	ctx.textBaseline = 'top'
	ctx.fillStyle = 'white'
	ctx.fillText(client.status, width / 2, 8, width * .9)
}

function pointer_down(x: number, y: number, id: number) {
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
	for (const control of controls) {
		if (control.move)
			control.move(x, y, id)
	}

	render()
}
function pointer_up(x: number, y: number, id: number) {
	for (const control of controls) {
		if (control.up)
			control.up(x, y, id)
	}

	render()
}

let down_pointers: number[] = []
window.addEventListener('pointerdown', (ev) => {
	ev.preventDefault()
	// down_pointers.push(ev.pointerId)

	pointer_down(ev.x, ev.y, ev.pointerId)
})

window.addEventListener('pointerup', (ev) => {
	// if (down_pointers.indexOf(ev.pointerId) < 0) return
	ev.preventDefault()

	// down_pointers.splice(down_pointers.indexOf(ev.pointerId))
	pointer_up(ev.x, ev.y, ev.pointerId)
})

window.addEventListener('pointermove', (ev) => {
	// if (down_pointers.indexOf(ev.pointerId) < 0) return
	ev.preventDefault()

	pointer_move(ev.x, ev.y, ev.pointerId)
})

canvas.addEventListener('touchstart', (ev) => ev.preventDefault())
// canvas.addEventListener('touchmove', (ev) =>ev.preventDefault())
