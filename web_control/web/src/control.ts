import { Client } from './client'

export interface Control {
	client: Client

	readonly sync: (forced: boolean) => void

	readonly down?: (x: number, y: number, pid: number) => void
	readonly move?: (x: number, y: number, pid: number) => void
	readonly up?: (x: number, y: number, pid: number) => void

	readonly render?: (ctx: CanvasRenderingContext2D) => void
}
