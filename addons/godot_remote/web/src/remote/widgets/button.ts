import { Remote } from '../remote'
import { Widget } from '../widget'
import { Context, math, vec } from '../../core'
import { ref } from '..'


export interface ButtonOptions {
	cx: number
	cy: number
	r?: number

	label?: string

	thickness?: number
}


export class Button extends Widget {
	cx: number
	cy: number
	r: number

	label?: string

	thickness: number


	private _pid = 0
	private _is_active = false


	constructor(remote: Remote, id: ref, options: ButtonOptions) {
		super(remote, id)

		this.cx = options.cx
		this.cy = options.cy
		this.r = options?.r || 3

		this.label = options?.label

		this.thickness = options.thickness || 0.5
	}


	sync = (): void => {
		this.remote.driver.send_reliable(this.remote.protocol.input_btn(this.id, this._is_active))
	}


	is_inside = (x: number, y: number): boolean => {
		return vec.distance_sqr(this.cx, this.cy, x, y) <= math.sqr(this.r)
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
		// Button
		ctx.translate(this.cx, this.cy)
		ctx.beginPath()
		ctx.ellipse(0, 0, this.r, this.r, 0, 0, 7)
		if (this._is_active) {
			ctx.fill()
		}
		ctx.lineWidth = this.thickness
		ctx.stroke()

		// Button label
		if (!this.label) return
		if (this._is_active) {
			ctx.globalCompositeOperation = 'destination-out'
		}
		ctx.font = `bold ${this.r}px Bespoke Sans`
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'
		ctx.fillText(this.label, 0, 0)
		ctx.globalCompositeOperation = 'source-over'
	}
}
