import { BinView } from '.'




export interface BinBuilder {
	size: number
	commands: ((view: BinView) => void)[]


	byte: (value: number) => this
	sbyte: (value: number) => this

	ushort: (value: number) => this
	short: (value: number) => this

	uint: (value: number) => this
	int: (value: number) => this

	ulong: (value: bigint) => this
	long: (value: bigint) => this

	float: (value: number) => this
	double: (value: number) => this

	fixed_sbyte: (value: number) => this
	fixed_short: (value: number) => this

	bytes: (value: Uint8Array | Uint8ClampedArray) => this
	str: (value: string) => this


	data_view: () => DataView
	array_buffer: () => ArrayBuffer
}


export function bin(): BinBuilder {
	const builder: BinBuilder = {
		commands: [],

		size: 0,

		byte: (value) => {
			builder.size += 1
			builder.commands.push((view) => view.put_byte(value))
			return builder
		},
		sbyte: (value) => {
			builder.size += 1
			builder.commands.push((view) => view.put_sbyte(value))
			return builder
		},

		ushort: (value) => {
			builder.size += 2
			builder.commands.push((view) => view.put_ushort(value))
			return builder
		},
		short: (value) => {
			builder.size += 2
			builder.commands.push((view) => view.put_short(value))
			return builder
		},

		uint: (value) => {
			builder.size += 4
			builder.commands.push((view) => view.put_byte(value))
			return builder
		},
		int: (value) => {
			builder.size += 4
			builder.commands.push((view) => view.put_sbyte(value))
			return builder
		},

		ulong: (value) => {
			builder.size += 8
			builder.commands.push((view) => view.put_ulong(value))
			return builder
		},
		long: (value) => {
			builder.size += 8
			builder.commands.push((view) => view.put_long(value))
			return builder
		},

		float: (value) => {
			builder.size += 4
			builder.commands.push((view) => view.put_float(value))
			return builder
		},
		double: (value) => {
			builder.size += 8
			builder.commands.push((view) => view.put_double(value))
			return builder
		},

		fixed_sbyte: (value) => {
			builder.size += 1
			builder.commands.push((view) => view.put_fixed_sbyte(value))
			return builder
		},
		fixed_short: (value) => {
			builder.size += 2
			builder.commands.push((view) => view.put_fixed_short(value))
			return builder
		},

		bytes: (value) => {
			builder.size += 4 + value.byteLength
			builder.commands.push((view) => view.put_bytes(value))
			return builder
		},
		str: (value) => {
			const encoder = new TextEncoder()
			const bytes = encoder.encode(value)
			builder.size += 4 + bytes.byteLength
			builder.commands.push((view) => view.put_bytes(bytes))
			return builder
		},

		data_view: () => {
			const view = new BinView(new ArrayBuffer(builder.size))
			for (const command of builder.commands) {
				command(view)
			}
			return view.data_view
		},
		array_buffer: () => {
			return builder.data_view().buffer
		},
	}

	return builder
}
