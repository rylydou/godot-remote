import { Remote } from '../remote'
import { Control } from '../control'
import { distance_sqr } from '../vec'

export interface MenuButtonOptions {
	center_x?: number
	center_y?: number
	icon?: string
}

export function create_icon_button(client: Remote, on_press: () => void, options?: MenuButtonOptions): Control {
	const center_x = options?.center_x || 0
	const center_y = options?.center_y || 0
	const icon = options?.icon || 'none'

	let pointer_id = 0
	let is_active = false

	const button = {
		remote: client,

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

			// ctx.lineCap = 'round'

			switch (icon) {
				case 'none':
					ctx.moveTo(-1.0, -1.0)
					ctx.lineTo(+1.0, -1.0)
					ctx.lineTo(+1.0, +1.0)
					ctx.lineTo(-1.0, +1.0)
					ctx.closePath()
					ctx.lineTo(+1.0, +1.0)
					ctx.lineWidth = .25
					ctx.stroke()
					break
				case 'menu':
					ctx.moveTo(-1.0, -0.5)
					ctx.lineTo(+1.0, -0.5)
					ctx.moveTo(-1.0, +0.0)
					ctx.lineTo(+1.0, +0.0)
					ctx.moveTo(-1.0, +0.5)
					ctx.lineTo(+1.0, +0.5)
					ctx.lineWidth = .25
					ctx.stroke()
					break
				case 'pause':
					ctx.moveTo(-1.0, +0.0)
					ctx.lineTo(+1.0, +0.0)
					ctx.moveTo(+0.0, -1.0)
					ctx.lineTo(+0.0, +1.0)

					ctx.lineWidth = .25
					// ctx.moveTo(-0.5, -1.0)
					// ctx.lineTo(-0.5, +1.0)
					// ctx.moveTo(+0.5, -1.0)
					// ctx.lineTo(+0.5, +1.0)
					// ctx.lineWidth = .5
					ctx.stroke()
					break
			}
		},
	} as Control

	return button
}
