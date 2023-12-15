export type ConnectionState = "closed" | "connected" | "connecting" | "disconnected" | "failed" | "new"


export abstract class Driver {
	abstract name: string


	is_connected = false
	connection_state: ConnectionState = 'new'
	on_connection_changed?: (state: ConnectionState) => void

	set_connection(state: ConnectionState): void {
		if (state === this.connection_state) return
		this.connection_state = state
		this.on_connection_changed?.(state)
	}


	status = ''
	on_status_changed?: (status: string) => void

	set_status(status: string): void {
		if (status === this.status) return
		this.status = status
		this.on_status_changed?.(status)
	}


	readonly abstract connect: () => Promise<void>
	readonly abstract disconnect: () => Promise<void>

	readonly abstract send_reliable: (message: any) => void
	readonly abstract send_unreliable: (message: any) => void


	on_message_received?: (message: any) => void

	on_opened?: () => void
	on_closed?: () => void
	on_error?: (reason: any) => void
}
