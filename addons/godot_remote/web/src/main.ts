import { fill_canvas } from './core'
import { Debug, Remote } from './remote'
import { Controls, Ping } from './remote/plugins'


async function main() {
	const canvas = document.getElementById('canvas') as HTMLCanvasElement
	if (!canvas) throw new Error('#canvas element was not found in the page.')

	const engine = new Remote(canvas)
	engine.scale = 16.0
	engine.plugin_stack = [
		'Controls',
		'Ping',
		'Debug',
	]

	const debug = new Debug(engine.create_plugin('Debug'))
	const ping = new Ping(engine.create_plugin('Ping'))
	const controls = new Controls(engine.create_plugin('Controls'))

	fill_canvas(canvas, () => engine.queue_redraw())
	engine.queue_redraw()
	engine.connect()
}


main()
