import { Client } from '../client.js'
import { Control } from '../control.js'
import { distance_sqr } from '../vec.js'

export interface ButtonOptions {
	label?: string
	center_x?: number
	center_y?: number
	radius?: number
}

export function create_button(client: Client, id: string, options?: ButtonOptions): Control {
	const label = options.label || ''
	const center_x = options.center_x || 0
	const center_y = options.center_y || 0
	const radius = options.radius || 3

	const outline_thickness = .5

	let active = false
	let pointer_id = 0

	function sync() {
		if (!client.is_connected) return
		client.send_button(id, active)
	}

	return {
		client,

		sync: sync,
		down(x, y, pid) {
			if (active) return

			if (distance_sqr(center_x, center_y, x, y) <= radius * radius) {
				active = true
				pointer_id = pid

				sync()
			}
		},
		up(x, y, pid) {
			if (!active) return
			if (pid != pointer_id) return

			active = false

			sync()
		},
		render(ctx) {
			ctx.translate(center_x, center_y)
			ctx.beginPath()
			ctx.ellipse(0, 0, radius, radius, 0, 0, 7)
			if (active) {
				ctx.fill()
			}

			ctx.lineWidth = outline_thickness
			ctx.stroke()

			if (active) {
				ctx.globalCompositeOperation = 'destination-out'
			}
			ctx.font = `bold ${radius}px Bespoke Sans`
			ctx.textAlign = 'center'
			ctx.textBaseline = 'middle'
			ctx.fillText(label, 0, 0)
			ctx.globalCompositeOperation = 'source-over'
		},
	}
}
