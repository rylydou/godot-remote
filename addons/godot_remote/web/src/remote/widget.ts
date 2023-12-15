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
