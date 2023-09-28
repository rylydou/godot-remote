export type ref = number | string

export interface Protocol {
	readonly handle_message: (message: any) => void

	readonly ping: (sts: number) => any
	readonly pong: (sts: number, rts: number) => any
	readonly input_btn: (id: ref, is_down: boolean) => any
	readonly input_axis: (id: ref, value: number) => any
	readonly input_joy: (id: ref, x: number, y: number) => any
	readonly name: (name: String) => any
	readonly session: (sid: number) => any
	readonly layout_ready: (id: ref) => any

	on_ping?: (sts: number) => void
	on_pong?: (sts: number, rts: number) => void
	on_sync?: (id: ref) => void
	on_sync_all?: () => void
	on_layout?: (id: ref) => void
	on_alert?: (title: String, body: String) => void
	on_banner?: (text: String) => void
	on_clear_banner?: () => void
}
