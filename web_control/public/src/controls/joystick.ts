import { Client } from '../client.js'
import { Control } from '../control.js'
import { clamp_length, distance_sqr } from '../vec.js'

export interface JoystickOptions {
	center_x?: number
	center_y?: number
	radius?: number
	padding?: number
	label?: string
}

export function create_joystick(client: Client, id: string, options?: JoystickOptions): Control {
	const radius = options.radius || 4
	const padding = options.padding || 1
	const bounds_thickness = .5
	const line = 1
	const handle_radius = 3
	const handle_outline = .5
	const label = options.label || ''

	let active = false
	let pointer_id = 0
	let center_x = options.center_x || 0
	let center_y = options.center_y || 0
	let stick_x = 0
	let stick_y = 0

	function sync() {
		if (!client.is_connected) return
		client.send_joy(id, stick_x, stick_y)
	}

	return {
		client,

		sync: sync,
		down(x, y, pid) {
			if (active) return
			if (distance_sqr(center_x, center_y, x, y) <= (radius + padding) * (radius + padding)) {
				active = true
				pointer_id = pid
			}
		},
		move(x, y, pid) {
			if (!active) return
			if (pid != pointer_id) return

			// Center and remap to -1/+1
			stick_x = (x - center_x) / radius
			stick_y = (y - center_y) / radius

			// Clamp the length
			const vec = clamp_length(stick_x, stick_y, 1)
			stick_x = vec[0]
			stick_y = vec[1]

			sync()
		},
		up(x, y, pid) {
			if (!active) return
			if (pid != pointer_id) return
			active = false

			stick_x = 0
			stick_y = 0

			sync()
		},
		render(ctx) {
			ctx.translate(center_x, center_y)

			ctx.lineCap = 'round'

			// Bounds ring
			ctx.beginPath()
			ctx.ellipse(0, 0, radius + padding, radius + padding, 0, 0, 7)
			ctx.lineWidth = bounds_thickness
			ctx.strokeStyle = 'white'
			ctx.stroke()

			// Handle outline
			ctx.beginPath()
			ctx.ellipse(stick_x * radius, stick_y * radius, handle_radius + handle_outline, handle_radius + handle_outline, 0, 0, 7)
			ctx.fillStyle = 'black'
			ctx.fill()

			// Line
			ctx.beginPath()
			ctx.moveTo(0, 0)
			ctx.lineTo(stick_x * radius, stick_y * radius)
			ctx.strokeStyle = 'white'
			ctx.lineWidth = line
			ctx.stroke()

			// Handle
			ctx.beginPath()
			ctx.ellipse(stick_x * radius, stick_y * radius, handle_radius, handle_radius, 0, 0, 7)
			ctx.strokeStyle = 'black'
			ctx.fillStyle = 'white'
			ctx.fill()

			ctx.fillStyle = 'black'
			ctx.font = `bold ${handle_radius}px Bespoke Sans`
			ctx.textAlign = 'center'
			ctx.textBaseline = 'middle'
			ctx.fillText(label, stick_x * radius, stick_y * radius)
		},
	}
}
