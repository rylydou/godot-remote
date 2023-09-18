export interface Driver {
	readonly connect: (address: string) => Promise<void>
	readonly disconnect: () => Promise<void>
	readonly send_reliable: (message: any) => void
	readonly send_unreliable: (message: any) => void
	readonly get_status: () => string

	on_message?: (message: any) => void
	on_status_change?: () => void

	on_open: () => void
	on_close: () => void
	on_error: (reason: any) => void
}
