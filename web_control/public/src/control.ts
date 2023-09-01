import { Client } from './client.js'

export interface Control {
	client: Client

	down?: (x: number, y: number, pid: number) => void
	move?: (x: number, y: number, pid: number) => void
	up?: (x: number, y: number, pid: number) => void
	sync?: () => void

	render?: (ctx: CanvasRenderingContext2D) => void
}
