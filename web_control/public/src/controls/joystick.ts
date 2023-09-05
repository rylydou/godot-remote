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

	const number_of_angles = 4
	const steps_of_precision = 2

	let active = false
	let pointer_id = 0
	let center_x = options.center_x || 0
	let center_y = options.center_y || 0
	let stick_x = 0
	let stick_y = 0
	let sync_x = 0
	let sync_y = 0

	// Implement number_of_angles and steps_of_precision
	function sync() {
		if (!client.is_connected) return
		let x = Math.round(stick_x)
		let y = Math.round(stick_y)
		if (x == sync_x && y == sync_y) return
		sync_x = x
		sync_y = y
		client.api.send_input_joy(id, x || 0, y || 0)
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
			ctx.stroke()

			// Handle outline
			ctx.beginPath()
			ctx.ellipse(stick_x * radius, stick_y * radius, handle_radius + handle_outline, handle_radius + handle_outline, 0, 0, 7)
			ctx.globalCompositeOperation = 'destination-out'
			ctx.fill()
			ctx.globalCompositeOperation = 'source-over'

			// Line
			ctx.beginPath()
			ctx.moveTo(0, 0)
			ctx.lineTo(stick_x * radius, stick_y * radius)
			ctx.lineWidth = line
			ctx.stroke()

			// Handle
			ctx.beginPath()
			ctx.ellipse(stick_x * radius, stick_y * radius, handle_radius, handle_radius, 0, 0, 7)
			ctx.fill()

			ctx.font = `bold ${handle_radius}px Bespoke Sans`
			ctx.textAlign = 'center'
			ctx.textBaseline = 'middle'
			ctx.globalCompositeOperation = 'destination-out'
			ctx.fillText(label, stick_x * radius, stick_y * radius)
			ctx.globalCompositeOperation = 'source-over'
		},
	}
}
