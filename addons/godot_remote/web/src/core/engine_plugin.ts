import { Context, Engine } from '.'


export interface EnginePlugin {
	engine: Engine
	id: string


	trace: (...data: any[]) => void
	debug: (...data: any[]) => void
	log: (...data: any[]) => void
	warn: (...data: any[]) => void
	error: (...data: any[]) => void


	resize?: (ctx: Context) => void

	draw?: (ctx: Context) => void

	pointer_down?: (pid: number, px: number, py: number) => boolean
	pointer_move?: (pid: number, px: number, py: number) => void
	pointer_up?: (pid: number, px: number, py: number) => void
}
