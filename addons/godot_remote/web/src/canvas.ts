export function scale_canvas(canvas: HTMLCanvasElement) {
	const parent = canvas.parentElement
	if (!parent) throw new Error('This canvas has no parent.')

	const resize_observer = new ResizeObserver(
		(entries, observer) => {
			_scale_resize(canvas, entries[0])
		}
	)

	resize_observer.observe(parent)

	return {
		destroy() {
			resize_observer.disconnect()
		}
	}
}

function _scale_resize(canvas: HTMLCanvasElement, entry: ResizeObserverEntry): void {
	let scale = Math.min(entry.contentBoxSize[0].inlineSize / canvas.width, entry.contentBoxSize[0].blockSize / canvas.height)
	scale = Math.floor(scale)
	canvas.style.width = canvas.width * scale + 'px'
	canvas.style.height = canvas.height * scale + 'px'
}

export function fill_canvas(canvas: HTMLCanvasElement, resized?: () => void) {
	const parent = canvas.parentElement
	if (!parent) throw new Error('This canvas has no parent.')

	const resize_observer = new ResizeObserver(
		(entries, observer) => {
			_fill_resize(canvas, entries[0])
			if (resized) resized()
		}
	)
	try {
		resize_observer.observe(parent, { box: 'device-pixel-content-box' })
	}
	catch {
		resize_observer.observe(parent, { box: 'content-box' })
	}

	return {
		destroy() {
			resize_observer.disconnect()
		}
	}
}

// based from: https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
function _fill_resize(canvas: HTMLCanvasElement, entry: ResizeObserverEntry): void {
	if (entry.devicePixelContentBoxSize) {
		// rounding just in case
		canvas.width = Math.round(entry.devicePixelContentBoxSize[0].inlineSize)
		canvas.height = Math.round(entry.devicePixelContentBoxSize[0].blockSize)

		return
	}

	let dpr = window.devicePixelRatio

	if (entry.contentBoxSize) {
		if (entry.contentBoxSize[0]) {
			canvas.width = Math.round(entry.contentBoxSize[0].inlineSize * dpr)
			canvas.height = Math.round(entry.contentBoxSize[0].blockSize * dpr)
			return
		}
		// legacy support (ignore the errors)
		// @ts-ignore
		canvas.width = Math.round(entry.contentBoxSize.inlineSize * dpr)
		// @ts-ignore
		canvas.height = Math.round(entry.contentBoxSize.blockSize * dpr)
		return
	}
	// super legacy support
	canvas.width = Math.round(entry.contentRect.width * dpr)
	canvas.height = Math.round(entry.contentRect.height * dpr)
}
