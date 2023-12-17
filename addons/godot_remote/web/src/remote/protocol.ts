export type ref = number | string


export abstract class RemoteProtocol {
	abstract parse_message(message: any): void

	on_ping?: (sts: number) => void
	on_pong?: (sts: number) => void
	on_sync?: (id: ref) => void
	on_sync_all?: () => void
	on_layout?: (id: ref) => void
	on_alert?: (title: string, body: string) => void
	on_banner?: (text: string) => void
	on_clear_banner?: () => void


	ping(timestamp: number): any { return null }
	pong(timestamp: number): any { return null }
	name(name: string): any { return null }
	session(sid: number): any { return null }
	layout_ready(id: ref): any { return null }

	input_btn(id: ref, is_down: boolean): any { return null }

	input_joy_move(id: ref, x: number, y: number): any { return null }
	input_joy_down(id: ref, x: number, y: number): any { return null }
	input_joy_up(id: ref, x: number, y: number): any { return null }
}
