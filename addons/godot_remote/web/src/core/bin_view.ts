import { math } from '.'


export class BinView {
	readonly data_view: DataView

	seek = 0


	constructor(view: ArrayBuffer) {
		this.data_view = new DataView(view)
	}


	// ----- Put -----
	put_byte(value: number): this {
		this.data_view.setUint8(this.seek, value); this.seek += 1
		return this
	}

	put_sbyte(value: number): this {
		this.data_view.setInt8(this.seek, value); this.seek += 1
		return this
	}


	put_ushort(value: number): this {
		this.data_view.setUint16(this.seek, value); this.seek += 2
		return this
	}

	put_short(value: number): this {
		this.data_view.setInt16(this.seek, value); this.seek += 2
		return this
	}


	put_uint(value: number): this {
		this.data_view.setUint32(this.seek, value); this.seek += 4
		return this
	}

	put_int(value: number): this {
		this.data_view.setInt32(this.seek, value); this.seek += 4
		return this
	}


	put_ulong(value: bigint): this {
		this.data_view.setBigUint64(this.seek, value); this.seek += 8
		return this
	}

	put_long(value: bigint): this {
		this.data_view.setBigInt64(this.seek, value); this.seek += 8
		return this
	}


	put_float(value: number): this {
		this.data_view.setFloat32(this.seek, value); this.seek += 4
		return this
	}

	put_double(value: number): this {
		this.data_view.setFloat64(this.seek, value); this.seek += 8
		return this
	}


	put_fixed_sbyte(value: number): this {
		const fixed = math.remap(value, -1.0, 1.0, -127, +128)
		this.put_sbyte(fixed)
		return this
	}

	put_fixed_short(value: number): this {
		const fixed = math.remap(value, -1.0, 1.0, -32_768, +32_767)
		this.put_short(fixed)
		return this
	}

	// // May not be accurate due to floating points :(
	// put_fixed_int(value: number): this {
	// 	value = math.remap(value, -1.0, 1.0, -2_147_483_648, +2_147_483_648)
	// 	this.data_view.setInt32(this.seek, value); this.seek += 1
	// 	return this
	// }


	put_bytes(bytes: Iterable<number>): this {
		let index = 0
		for (const byte of bytes) {
			this.data_view.setUint8(this.seek + index, byte)
			index++
		}
		return this
	}

	put_str(str: string): this {
		const text_encoder = new TextEncoder()
		const bytes = text_encoder.encode(str)
		this.put_bytes(bytes)
		return this
	}


	// ----- Get -----
	get_byte(): number {
		const value = this.data_view.getUint8(this.seek); this.seek += 1
		return value
	}

	get_sbyte(): number {
		const value = this.data_view.getInt8(this.seek); this.seek += 1
		return value
	}


	get_ushort(): number {
		const value = this.data_view.getUint16(this.seek); this.seek += 2
		return value
	}

	get_short(): number {
		const value = this.data_view.getInt16(this.seek); this.seek += 2
		return value
	}


	get_uint(): number {
		const value = this.data_view.getUint32(this.seek); this.seek += 4
		return value
	}

	get_int(): number {
		const value = this.data_view.getInt32(this.seek); this.seek += 4
		return value
	}


	get_ulong(): bigint {
		const value = this.data_view.getBigUint64(this.seek); this.seek += 8
		return value
	}

	get_long(): bigint {
		const value = this.data_view.getBigInt64(this.seek); this.seek += 8
		return value
	}


	get_float(): number {
		const value = this.data_view.getFloat32(this.seek); this.seek += 4
		return value
	}

	get_double(): number {
		const value = this.data_view.getFloat64(this.seek); this.seek += 8
		return value
	}


	get_bytes(): Uint8ClampedArray {
		const length = this.get_uint()
		const bytes = new Uint8ClampedArray(this.data_view.buffer.slice(this.seek, this.seek + length))
		this.seek += length
		return bytes
	}

	get_str(): string {
		const bytes = this.get_bytes()
		const decoder = new TextDecoder()
		const str = decoder.decode(bytes)
		return str
	}
}
