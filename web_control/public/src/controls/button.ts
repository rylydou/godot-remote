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

	let pointer_id = 0
	let is_active = false
	let synced_active = false

	const button = {
		client,

		force_sync() {
			if (!client.is_connected) return
			if (synced_active == is_active) return
			button.force_sync()
		},
		auto_sync() {
			synced_active = is_active
			client.api.send_input_btn(id, synced_active)
		},

		down(x, y, pid) {
			if (is_active) return

			if (distance_sqr(center_x, center_y, x, y) <= radius * radius) {
				is_active = true
				pointer_id = pid

				button.force_sync()
			}
		},
		up(x, y, pid) {
			if (!is_active) return
			if (pid != pointer_id) return

			is_active = false

			button.force_sync()
		},
		render(ctx) {
			ctx.translate(center_x, center_y)
			ctx.beginPath()
			ctx.ellipse(0, 0, radius, radius, 0, 0, 7)
			if (is_active) {
				ctx.fill()
			}

			ctx.lineWidth = outline_thickness
			ctx.stroke()

			if (is_active) {
				ctx.globalCompositeOperation = 'destination-out'
			}
			ctx.font = `bold ${radius}px Bespoke Sans`
			ctx.textAlign = 'center'
			ctx.textBaseline = 'middle'
			ctx.fillText(label, 0, 0)
			ctx.globalCompositeOperation = 'source-over'
		},
	} as Control

	return button
}
