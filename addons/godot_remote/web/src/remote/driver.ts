export type ConnectionState = 'unknown' | 'closed' | 'connected' | 'connecting' | 'disconnected' | 'failed' | 'new'


export abstract class Driver {
	abstract name: string


	connection_state: ConnectionState = 'new'
	on_connection_changed?: (state: ConnectionState) => void

	set_connection(state: ConnectionState): void {
		if (state === this.connection_state) return
		this.connection_state = state
		this.on_connection_changed?.(state)
	}


	on_status_changed?: () => void
	readonly abstract get_status: () => string

	readonly abstract connect: () => Promise<void>
	readonly abstract disconnect: () => Promise<void>

	readonly abstract send_reliable: (message: any) => void
	readonly abstract send_unreliable: (message: any) => void


	on_message_received?: (message: any) => void

	on_opened?: () => void
	on_closed?: () => void
	on_error?: (reason: any) => void
}
