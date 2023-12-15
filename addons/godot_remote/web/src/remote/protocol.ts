export type ref = number | string


export abstract class RemoteProtocol {
	readonly abstract parse_message: (message: any) => void

	on_ping?: (sts: number) => void = undefined
	on_pong?: (sts: number, rts: number) => void = undefined
	on_sync?: (id: ref) => void = undefined
	on_sync_all?: () => void = undefined
	on_layout?: (id: ref) => void = undefined
	on_alert?: (title: string, body: string) => void = undefined
	on_banner?: (text: string) => void = undefined
	on_clear_banner?: () => void = undefined


	readonly abstract ping: (sts: number) => any
	readonly abstract pong: (sts: number, rts: number) => any
	readonly abstract name: (name: string) => any
	readonly abstract session: (sid: number) => any
	readonly abstract layout_ready: (id: ref) => any

	readonly abstract input_btn: (id: ref, is_down: boolean) => any
	readonly abstract input_axis: (id: ref, value: number) => any

	readonly abstract input_joy_down: (id: ref, x: number, y: number) => any
	readonly abstract input_joy_move: (id: ref, x: number, y: number) => any
	readonly abstract input_joy_up: (id: ref, x: number, y: number) => any
}
