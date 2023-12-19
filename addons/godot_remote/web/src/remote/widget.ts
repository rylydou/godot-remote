import { ref } from '.'
import { Context } from '../core'
import { Remote } from './remote'


export class Widget {
	remote: Remote
	id: ref


	constructor(remote: Remote, id: ref) {
		this.remote = remote
		this.id = id
	}


	tick = (): void => { }
	sync = (): void => { }

	down = (pid: number, px: number, py: number): boolean => false
	move = (pid: number, px: number, py: number): void => { }
	up = (pid: number, px: number, py: number): void => { }

	draw = (ctx: Context): void => { }
}



/*
	export interface Widget {
		remote: Remote


		init?: () => void

		tick?: () => void
		sync?: () => void
		draw?: (ctx: Context) => void

		pointer_down?: (pid: number, px: number, py: number) => boolean
		pointer_move?: (pid: number, px: number, py: number) => void
		pointer_up?: (pid: number, px: number, py: number) => void
	}
*/
