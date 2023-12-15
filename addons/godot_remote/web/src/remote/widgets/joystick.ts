import { Remote, Widget } from '..'
import { Context, vec } from '../../core'


export interface JoystickOptions {
	cx: number
	cy: number
	r?: number
	pad?: number

	label?: string

	stick_radius?: number
}


export class Joystick extends Widget {
	cx: number
	cy: number
	r: number
	pad: number
	thickness: number

	label?: string

	stick_radius: number
	stick_outline: number
	stick_thickness: number

	stick_x = 0.0
	stick_y = 0.0

	private _pid = 0
	private _is_active = false


	constructor(remote: Remote, options: JoystickOptions) {
		super(remote)

		this.cx = options.cx
		this.cy = options.cy
		this.r = options?.r || 3
		this.pad = options.pad || 1
		this.thickness = 0.5

		this.label = options?.label

		this.stick_radius = options.stick_radius || 3
		this.stick_outline = 0.5
		this.stick_thickness = 1.0
	}


	is_inside = (x: number, y: number): boolean => {
		return vec.distance_sqr(this.cx, this.cy, x, y) <= (this.r + this.pad) * (this.r + this.pad)
	}


	down = (pid: number, px: number, py: number): boolean => {
		if (this._is_active) return false
		if (!this.is_inside(px, py)) return false

		this._is_active = true
		this._pid = pid

		this.move(pid, px, py)
		this.sync()
		return true
	}


	move = (pid: number, px: number, py: number): void => {
		if (!this._is_active) return
		if (this._pid != pid) return

		// Center and remap to -1/+1
		this.stick_x = (px - this.cx) / this.r
		this.stick_y = (py - this.cy) / this.r

		// Clamp the length
		'i ♥️ js';[this.stick_x, this.stick_y] = vec.clamp_length(this.stick_x, this.stick_y, 1)

		this.remote.queue_redraw()
	}


	up = (pid: number, px: number, py: number): void => {
		if (!this._is_active) return
		if (this._pid != pid) return

		this.stick_x = 0
		this.stick_y = 0

		this._is_active = false
		this.sync()

		this.remote.queue_redraw()
	}


	draw = (ctx: Context): void => {
		const stick_px = this.stick_x * this.r
		const stick_py = this.stick_y * this.r

		ctx.translate(this.cx, this.cy)
		ctx.lineCap = 'round'

		// Joystick Bounds Ring
		ctx.beginPath()
		ctx.ellipse(0, 0, this.r + this.pad, this.r + this.pad, 0, 0, 7)
		ctx.lineWidth = this.thickness
		ctx.stroke()

		// Stick Handle Outline
		ctx.beginPath()
		ctx.ellipse(stick_px, stick_py, this.stick_radius + this.stick_outline, this.stick_radius + this.stick_outline, 0, 0, 7)
		ctx.globalCompositeOperation = 'destination-out'
		ctx.fill()
		ctx.globalCompositeOperation = 'source-over'

		// Stick Line
		ctx.beginPath()
		ctx.moveTo(0, 0)
		ctx.lineTo(stick_px, stick_py)
		ctx.lineWidth = this.stick_thickness
		ctx.stroke()

		// Stick Handle
		ctx.beginPath()
		ctx.ellipse(stick_px, stick_py, this.stick_radius, this.stick_radius, 0, 0, 7)
		ctx.fill()

		// Stick Label
		if (!this.label) return
		ctx.font = `bold ${this.stick_radius}px Bespoke Sans`
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'
		ctx.globalCompositeOperation = 'destination-out'
		ctx.fillText(this.label, stick_px, stick_py)
		ctx.globalCompositeOperation = 'source-over'
	}
}
