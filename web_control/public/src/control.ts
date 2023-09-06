import { Client } from './client.js'

export interface Control {
	client: Client

	auto_sync?: () => void
	force_sync?: () => void

	down?: (x: number, y: number, pid: number) => void
	move?: (x: number, y: number, pid: number) => void
	up?: (x: number, y: number, pid: number) => void

	render?: (ctx: CanvasRenderingContext2D) => void
}
