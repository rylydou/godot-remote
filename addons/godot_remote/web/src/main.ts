import { fill_canvas } from './core'
import { Config, Remote } from './remote'
import * as plugin from './remote/plugins'

// import './extras/orient'

const canvas = document.getElementById('canvas') as HTMLCanvasElement


// ----- Engine Init -----
const engine = new Remote(canvas)
plugin.debug(engine.create_plugin('debug'))
plugin.leave(engine.create_plugin('leave')) // }- Dialog together strong!
plugin.name(engine.create_plugin('name'))   // }
plugin.menu(engine.create_plugin('menu'))   // }
plugin.toasts(engine.create_plugin('toasts'))
plugin.ping(engine.create_plugin('ping'))
plugin.controls(engine.create_plugin('controls'))


fill_canvas(canvas, () => engine.queue_redraw())
engine.queue_redraw()
engine.connect()
