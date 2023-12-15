import { Remote } from '../remote'
import { Widget } from '../widget'
import { Context, vec } from '../../core'
import { ref } from '..'


export interface MenuButtonOptions {
	cx: number
	cy: number

	icon?: string
}


export class MenuButton extends Widget {
	cx: number
	cy: number
	r: number

	icon: string


	private _pid = 0
	private _is_active = false


	constructor(remote: Remote, id: ref, options: MenuButtonOptions) {
		super(remote, id)

		this.cx = options.cx
		this.cy = options.cy
		this.r = 2.0

		this.icon = options.icon || 'none'
	}


	is_inside = (x: number, y: number): boolean => {
		return vec.distance_sqr(this.cx, this.cy, x, y) <= this.r * this.r
	}


	down = (pid: number, px: number, py: number): boolean => {
		if (this._is_active) return false
		if (!this.is_inside(px, py)) return false

		this._is_active = true
		this._pid = pid
		this.sync()
		this.remote.queue_redraw()
		return true
	}


	up = (pid: number, px: number, py: number): void => {
		if (!this._is_active) return
		if (this._pid != pid) return

		this._is_active = false
		this.sync()
		this.remote.queue_redraw()
	}


	draw = (ctx: Context): void => {
		ctx.translate(this.cx, this.cy)
		if (this._is_active) {
			ctx.scale(.9, .9)
		}

		ctx.beginPath()
		// ctx.lineCap = 'round'
		switch (this.icon) {
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
				// ctx.moveTo(-1.0, +0.0)
				// ctx.lineTo(+1.0, +0.0)
				// ctx.moveTo(+0.0, -1.0)
				// ctx.lineTo(+0.0, +1.0)

				ctx.lineWidth = .25
				ctx.moveTo(-0.5, -1.0)
				ctx.lineTo(-0.5, +1.0)
				ctx.moveTo(+0.5, -1.0)
				ctx.lineTo(+0.5, +1.0)
				ctx.lineWidth = .5
				ctx.stroke()
				break

			default:
				ctx.moveTo(-1.0, -1.0)
				ctx.lineTo(+1.0, -1.0)
				ctx.lineTo(+1.0, +1.0)
				ctx.lineTo(-1.0, +1.0)
				ctx.closePath()
				ctx.lineTo(+1.0, +1.0)
				ctx.lineWidth = .25
				ctx.stroke()
				break
		}
	}
}
