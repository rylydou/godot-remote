import { Engine, fill_canvas } from './core'
import { Debug, Remote } from './remote'


async function main() {
	const canvas = document.getElementById('canvas') as HTMLCanvasElement
	if (!canvas) throw new Error('#canvas element was not found in the page.')

	const engine = new Engine(canvas)
	engine.scale = 16.0
	fill_canvas(canvas, engine.queue_redraw)
	engine.plugin_stack = [
		'remote',
		'debug',
	]

	const remote = new Remote(engine.create_plugin('remote'))
	const debug = new Debug(engine.create_plugin('debug'), remote)

	engine.queue_redraw.bind(engine)
	engine.queue_redraw()
}


main()
