import { RemotePlugin } from '..'


export const leave = (plugin: RemotePlugin): void => {
	const leave_dialog = document.getElementById('leave-dialog') as HTMLDialogElement


	const leave = (): void => {
		plugin.remote.send(plugin.remote.protocol.leave())

		setTimeout(() => {
			plugin.remote.disconnect()
			window.close() // It worked once on Safari iOS
		}, 1000)
	}
	window.remote_leave = leave


	const show_leave_dialog = (): void => {
		window.remote_close_menu()
		leave_dialog.inert = true
		leave_dialog.showModal()
		leave_dialog.inert = false
	}
	window.remote_open_leave_dialog = show_leave_dialog
}
