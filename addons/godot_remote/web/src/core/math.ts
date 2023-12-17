export const sqr = (x: number): number => x * x

export const sign = (x: number): number => x === 0 ? 0 : x > 0 ? 1 : -1


export const clamp = (x: number, min: number, max: number): number => Math.max(Math.min(x, max), min)

export const lerp = (a: number, b: number, t: number): number => a + t * (b - a)

export const remap = (x: number, a1: number, b1: number, a2: number, b2: number,): number => a2 + (b2 - a2) * (x - a1) / (b1 - a1)
