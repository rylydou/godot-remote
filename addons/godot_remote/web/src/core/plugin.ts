import { Context, Engine } from '.'


export interface Plugin {
	engine: Engine
	id: string


	trace: (...data: any[]) => void
	debug: (...data: any[]) => void
	log: (...data: any[]) => void
	warn: (...data: any[]) => void
	error: (...data: any[]) => void


	/** DO NOT USE THIS TO DRAW!
 * 
 * A context is only provided for getting the canvas size, not drawing. */
	resize?: (ctx: Context) => void


	draw?: (ctx: Context) => void

	pointer_down?: (pid: number, px: number, py: number) => boolean
	pointer_move?: (pid: number, px: number, py: number) => void
	pointer_up?: (pid: number, px: number, py: number) => void
}
