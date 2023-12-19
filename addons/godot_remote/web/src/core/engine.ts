import { Context, EnginePlugin, } from '.'


export class Engine {
	readonly canvas: HTMLCanvasElement
	readonly ctx: Context

	readonly plugins: EnginePlugin[] = []


	rem = 16.0


	screen_log: string[] = []


	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas

		let canvas_ctx = canvas.getContext('2d') as Context
		canvas_ctx.scale_factor = this.rem
		canvas_ctx.w = 1.0
		canvas_ctx.h = 1.0
		this.ctx = canvas_ctx

		canvas.addEventListener('pointerdown', (ev) => {
			ev.preventDefault()
			this.pointer_down(ev)
		})
		window.addEventListener('pointermove', (ev) => {
			ev.preventDefault()
			this.pointer_move(ev)
		})
		window.addEventListener('pointerup', (ev) => {
			ev.preventDefault()
			this.pointer_up(ev)
		})
		canvas.addEventListener('touchstart', (ev) => {
			ev.preventDefault()
		})
	}


	create_plugin(id: string): EnginePlugin {
		const plugin: EnginePlugin = {
			engine: this,
			id: id,

			trace: (data) => console.trace(`[${id}] `, data),
			debug: (data) => console.debug(`[${id}] `, data),
			log: (data) => console.log(`[${id}] `, data),
			warn: (data) => console.warn(`[${id}] `, data),
			error: (data) => console.error(`[${id}] `, data),
		}

		this.plugins.push(plugin)
		return plugin
	}


	*plugin_iter(): Generator<EnginePlugin> {
		// return this.plugins
		for (const plugin of this.plugins) {
			yield plugin
		}
	}


	transform_event(event: { x: number, y: number }): [number, number] {
		return [
			event.x / this.rem,
			event.y / this.rem,
		]
	}


	private _is_redraw_queued = false
	queue_redraw(): void {
		if (this._is_redraw_queued) return
		this._is_redraw_queued = true

		requestAnimationFrame((time) => this.draw())
	}


	private _canvas_w = -1
	private _canvas_h = -1
	draw(): void {
		this._is_redraw_queued = false

		const ctx = this.ctx
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

		ctx.scale_factor = this.rem * window.devicePixelRatio
		ctx.w = this.canvas.width / ctx.scale_factor
		ctx.h = this.canvas.height / ctx.scale_factor

		if (ctx.w != this._canvas_w || ctx.h != this._canvas_h) {
			this._canvas_w = ctx.w
			this._canvas_h = ctx.h
			for (const plugin of this.plugin_iter()) {
				plugin.resize?.(ctx)
			}
		}

		ctx.save()
		ctx.scale(ctx.scale_factor, ctx.scale_factor)
		for (const plugin of this.plugin_iter()) {
			ctx.save()
			plugin.draw?.(ctx)
			ctx.restore()
		}
		ctx.restore()
	}


	pointer_down(event: PointerEvent): void {
		const [px, py] = this.transform_event(event)
		for (const plugin of this.plugin_iter()) {
			if (!plugin.pointer_down) continue
			const is_handled = plugin.pointer_down?.(event.pointerId, px, py)
			if (is_handled) return
		}
	}


	pointer_move(event: PointerEvent): void {
		const [px, py] = this.transform_event(event)
		for (const plugin of this.plugin_iter()) {
			plugin.pointer_move?.(event.pointerId, px, py)
		}
	}


	pointer_up(event: PointerEvent): void {
		const [px, py] = this.transform_event(event)
		for (const plugin of this.plugin_iter()) {
			plugin.pointer_up?.(event.pointerId, px, py)
		}
	}
}
