import { Engine } from '.'

export class Layer {
	engine: Engine = null!


	pointer_down(px: number, py: number): boolean { return false }
	pointer_move(px: number, py: number): boolean { return false }
	pointer_up(px: number, py: number): boolean { return false }

	draw(ctx: CanvasContext): void { }
}
