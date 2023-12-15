import { RemoteProtocol, ref } from '..'


export class BinaryProtocol extends RemoteProtocol {
	readonly parse_message = (message: any): void => {
		const array = message as ArrayBuffer
		const binary = new DataView(array)
		let seek = 0

		const type = binary.getInt8(seek); seek += 1
		const length = array.byteLength - 1
		switch ([type, length]) {
			// Ping packet
			case [1, 8]: {
				const sts = binary.getUint32(seek); seek += 4
				this.on_ping?.(sts)
				break
			}

			case [1, 16]: {
				const sts = binary.getUint32(seek); seek += 4
				const rts = binary.getUint32(seek); seek += 4
				this.on_pong?.(sts, rts)
				break
			}
		}
	}


	readonly input_joy_down = (id: ref, x: number, y: number): any => {
		const array = new ArrayBuffer(1 + 1 + 1)
		const binary = new DataView(array)
		let seek = 0

		binary.setInt8(id as number, seek); seek += 1

		return array
	}
}
