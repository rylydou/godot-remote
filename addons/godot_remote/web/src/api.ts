import { Driver } from './driver'

export type ref = number | string

export interface API {
	readonly driver: Driver

	receive_ping: (sts: number) => void
	receive_pong: (sts: number, rts: number) => void
	receive_sync: (id: ref) => void
	receive_sync_all: () => void
	receive_layout: (id: ref) => void
	receive_alert: (title: String, body: String) => void
	receive_banner: (text: String) => void
	receive_clear_banner: () => void

	readonly send_ping: (sts: number) => void
	readonly send_pong: (sts: number, rts: number) => void
	readonly send_input_btn: (id: ref, is_down: boolean) => void
	readonly send_input_axis: (id: ref, value: number) => void
	readonly send_input_joy: (id: ref, x: number, y: number) => void
	readonly send_name: (name: String) => void
	readonly send_session: (sid: number) => void
	readonly send_layout_ready: (id: ref) => void
}
