import { Context } from '.'


export class Monitor {
	readonly size: number
	readonly data: number[]
	index = 1

	current = 0

	rolling_average = 0
	private _rolling_average_sum = 0
	private _rolling_average_count = 0

	average = 0
	private _average_sum = 0


	constructor(size = 100) {
		this.size = size
		this.data = Array(size)
		this.data.fill(0)
	}


	log(num: number) {
		this.current = num

		let overwritten_num = this.data[this.index]
		this.data[this.index] = num
		this.index = (this.index + 1) % this.data.length

		this._average_sum -= overwritten_num
		this._average_sum += num
		this.average = this._average_sum / this.data.length

		this._rolling_average_sum += num
		this._rolling_average_count++
		this.rolling_average = this._rolling_average_sum / this._rolling_average_count
	}

	reset_rolling_average() {
		this._rolling_average_sum = 0
		this._rolling_average_count = 0
		this.rolling_average = 0
	}

	time_func(func: () => void) {
		const start_time = performance.now()
		func()
		this.log(performance.now() - start_time)
	}


	draw(ctx: Context, y_mark = 0, x_scale = 1, y_scale = 1): void {
		if (y_mark > 0) {
			ctx.globalAlpha /= 8
			ctx.fillRect(0, y_mark * y_scale, this.data.length * x_scale, 1)
			ctx.globalAlpha *= 8
		}

		for (let index = 0; index < this.data.length; index++) {
			const num = this.data[index]
			ctx.fillRect(index * x_scale, 0, x_scale, num * y_scale)
		}

		ctx.save()
		ctx.fillStyle = 'white'
		ctx.fillRect(this.index * x_scale, 0, x_scale, this.current * y_scale)
		ctx.restore()
	}
}
