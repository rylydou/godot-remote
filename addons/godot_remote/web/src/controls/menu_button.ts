import { Client } from '../client'
import { Control } from '../control'
import { distance_sqr } from '../vec'

export interface MenuButtonOptions {
	center_x?: number
	center_y?: number
}

export function create_menu_button(client: Client, on_press: () => void, options?: MenuButtonOptions): Control {
	const center_x = options?.center_x || 0
	const center_y = options?.center_y || 0

	let pointer_id = 0
	let is_active = false

	const button = {
		client,

		down(x, y, pid) {
			if (is_active) return

			if (distance_sqr(center_x, center_y, x, y) <= 4) {
				is_active = true
				pointer_id = pid
			}
		},
		up(x, y, pid) {
			if (!is_active) return
			if (pid != pointer_id) return

			is_active = false
			on_press()
		},
		render(ctx) {
			ctx.translate(center_x, center_y)
			ctx.beginPath()

			if (is_active) {
				ctx.scale(.9, .9)
			}

			ctx.moveTo(-1, -.5)
			ctx.lineTo(1, -.5)
			ctx.moveTo(-1, 0)
			ctx.lineTo(1, 0)
			ctx.moveTo(-1, .5)
			ctx.lineTo(1, .5)

			ctx.lineWidth = .25
			ctx.stroke()
		},
	} as Control

	return button
}
