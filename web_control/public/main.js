import { fullscreen_canvas } from './modules/canvas.mjs'

let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')

fullscreen_canvas(canvas)

function move_pointer(x, y) {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

	ctx.fillStyle = 'white'
	ctx.strokeStyle = 'white'
	ctx.beginPath()
	ctx.moveTo(ctx.canvas.width / 2, ctx.canvas.height / 2)
	ctx.lineTo(x, y)
	ctx.stroke()

	ctx.beginPath()
	ctx.ellipse(x, y, 16, 16, 0, 0, 7)
	ctx.fill()
}

let pointer_down = false
canvas.addEventListener('pointerdown', (ev) => {
	ev.preventDefault()
	pointer_down = true
})
window.addEventListener('pointerup', (ev) => {
	ev.preventDefault()
	pointer_down = false
})
window.addEventListener('pointermove', (ev) => {
	ev.preventDefault()
	if (pointer_down) {
		move_pointer(ev.x, ev.y)
	}
})

canvas.addEventListener('touchmove', (ev) => {
	// move_pointer(ev.touches[0].clientX, ev.touches[0].clientY)
	ev.preventDefault()
})
