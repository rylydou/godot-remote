import { Context, EnginePlugin, } from '.'


export interface Engine {
	// Constants
	readonly canvas: HTMLCanvasElement
	readonly ctx: Context

	// Plugins
	readonly plugins: EnginePlugin[]
	add_plugin: (plugin: EnginePlugin) => void

	// Drawing
	queue_redraw(): void
	draw(): void

	// Input
	transform_event: (event: { x: number, y: number }) => [number, number]
}


export const engine = (canvas: HTMLCanvasElement): Engine => {
	const rem = 16.0

	const ctx = canvas.getContext('2d') as Context
	ctx.scale_factor = 1.0
	ctx.w = 1.0
	ctx.h = 1.0


	const plugins: EnginePlugin[] = []
	const add_plugin = (plugin: EnginePlugin): void {
		plugins.push(plugin)
	}


	const transform_event = (event: { x: number, y: number }): [number, number] => {
		return [
			event.x / rem,
			event.y / rem,
		]
	}


	let is_redraw_queued = false
	const queue_redraw = (): void => {
		if (is_redraw_queued) return
		is_redraw_queued = true

		requestAnimationFrame((time) => draw())
	}


	let canvas_w = -1
	let canvas_h = -1
	const draw = (): void => {
		is_redraw_queued = false

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		ctx.scale_factor = rem * window.devicePixelRatio
		ctx.w = canvas.width / ctx.scale_factor
		ctx.h = canvas.height / ctx.scale_factor

		if (ctx.w != canvas_w || ctx.h != canvas_h) {
			canvas_w = ctx.w
			canvas_h = ctx.h
			for (const plugin of plugins) {
				plugin.resize?.(ctx)
			}
		}

		ctx.save()
		ctx.scale(ctx.scale_factor, ctx.scale_factor)
		for (const plugin of plugins) {
			ctx.save()
			plugin.draw?.(ctx)
			ctx.restore()
		}
		ctx.restore()
	}


	const pointer_down = (event: PointerEvent): void => {
		const [px, py] = transform_event(event)
		for (const plugin of plugins) {
			if (!plugin.pointer_down) continue
			const is_handled = plugin.pointer_down?.(event.pointerId, px, py)
			if (is_handled) return
		}
	}


	const pointer_move = (event: PointerEvent): void => {
		const [px, py] = transform_event(event)
		for (const plugin of plugins) {
			plugin.pointer_move?.(event.pointerId, px, py)
		}
	}


	const pointer_up = (event: PointerEvent): void => {
		const [px, py] = transform_event(event)
		for (const plugin of plugins) {
			plugin.pointer_up?.(event.pointerId, px, py)
		}
	}


	canvas.addEventListener('pointerdown', (ev) => {
		ev.preventDefault()
		pointer_down(ev)
	})
	window.addEventListener('pointermove', (ev) => {
		ev.preventDefault()
		pointer_move(ev)
	})
	window.addEventListener('pointerup', (ev) => {
		ev.preventDefault()
		pointer_up(ev)
	})
	canvas.addEventListener('touchstart', (ev) => {
		ev.preventDefault()
	})


	return {
		// Constants
		canvas,
		ctx,

		// Plugins
		plugins,
		add_plugin,

		// Drawing
		queue_redraw,
		draw,

		// Input
		transform_event,
	}
}
