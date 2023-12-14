import { Remote } from '../remote'
import { Control } from '../control'
import { angle, clamp_length, distance_sqr, from_angle, length } from '../vec'


export interface JoystickOptions {
	center_x?: number
	center_y?: number
	radius?: number
	padding?: number
	label?: string
	high_precision?: boolean
}


export function create_joystick(remote: Remote, id: string, options?: JoystickOptions): Control {
	const radius = options?.radius || 4
	const padding = options?.padding || 1
	const bounds_thickness = .5
	const line = 1
	const handle_radius = 3
	const handle_outline = .5
	const label = options?.label || ''

	let active = false
	let pointer_id = 0
	let center_x = options?.center_x || 0
	let center_y = options?.center_y || 0
	let x = 0
	let y = 0

	let age = 0

	const joystick = {
		remote: remote,

		sync(forced) {
			age++
			if (!remote.driver.is_connected) return

			remote.driver.send_unreliable(remote.protocol.input_joy(id, x, y))
		},

		down(x, y, pid) {
			if (active) return
			if (distance_sqr(center_x, center_y, x, y) <= (radius + padding) * (radius + padding)) {
				active = true
				pointer_id = pid
			}

			joystick.sync(true)
		},
		move(cx, cy, pid) {
			if (!active) return
			if (pid != pointer_id) return

			// Center and remap to -1/+1
			x = (cx - center_x) / radius
			y = (cy - center_y) / radius

			// Clamp the length
			const vec = clamp_length(x, y, 1)
			x = vec[0]
			y = vec[1]
		},
		up(cx, cy, pid) {
			if (!active) return
			if (pid != pointer_id) return
			active = false

			x = 0
			y = 0

			joystick.sync(true)
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
			ctx.ellipse(x * radius, y * radius, handle_radius + handle_outline, handle_radius + handle_outline, 0, 0, 7)
			ctx.globalCompositeOperation = 'destination-out'
			ctx.fill()
			ctx.globalCompositeOperation = 'source-over'

			// Line
			ctx.beginPath()
			ctx.moveTo(0, 0)
			ctx.lineTo(x * radius, y * radius)
			ctx.lineWidth = line
			ctx.stroke()

			// Handle
			ctx.beginPath()
			ctx.ellipse(x * radius, y * radius, handle_radius, handle_radius, 0, 0, 7)
			ctx.fill()

			ctx.font = `bold ${handle_radius}px Bespoke Sans`
			ctx.textAlign = 'center'
			ctx.textBaseline = 'middle'
			ctx.globalCompositeOperation = 'destination-out'
			ctx.fillText(label, x * radius, y * radius)
			ctx.globalCompositeOperation = 'source-over'
		},
	} as Control

	return joystick
}
