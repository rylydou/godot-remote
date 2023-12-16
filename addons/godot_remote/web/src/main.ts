import { fill_canvas } from './core'
import { Debug, Remote } from './remote'
import { Controls, Ping } from './remote/plugins'


async function main() {
	const canvas = document.getElementById('canvas') as HTMLCanvasElement
	if (!canvas) throw new Error('#canvas element was not found in the page.')

	const engine = new Remote(canvas)
	engine.scale = 16.0
	fill_canvas(canvas, () => engine.queue_redraw())
	engine.plugin_stack = [
		'controls',
		'ping',
		'debug',
	]

	const debug = new Debug(engine.create_plugin('debug'))
	const ping = new Ping(engine.create_plugin('ping'))
	const controls = new Controls(engine.create_plugin('controls'))

	engine.queue_redraw()
	engine.connect()
}


main()
