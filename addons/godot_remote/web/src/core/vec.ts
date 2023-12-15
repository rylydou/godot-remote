export function length_sqr(x: number, y: number): number {
	return x * x + y * y
}

export function length(x: number, y: number): number {
	return Math.sqrt(x * x + y * y)
}


export function distance_sqr(x1: number, y1: number, x2: number, y2: number): number {
	const dx = (x2 - x1)
	const dy = (y2 - y1)
	return length_sqr(dx, dy)
}


export function distance(x1: number, y1: number, x2: number, y2: number): number {
	const dx = (x2 - x1)
	const dy = (y2 - y1)
	return length(dx, dy)
}


export function normalize(x: number, y: number): [number, number] {
	const len = length(x, y)
	return [x / len, y / len]
}


export function clamp_length(x: number, y: number, max_length: number): [number, number] {
	const len = length(x, y)
	const factor = Math.min(len, max_length) / len
	return [x * factor, y * factor]
}


// Returns the angle (in radians) from the X axis to a point.
export function angle(x: number, y: number): number {
	return Math.atan2(y, x)
}


export function from_angle(angle_rad: number, length: number): [number, number] {
	return [Math.cos(angle_rad) * length, Math.sin(angle_rad) * length]
}
