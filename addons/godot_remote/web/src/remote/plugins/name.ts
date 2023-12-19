import { Config, RemotePlugin } from '..'


export const name = (plugin: RemotePlugin): void => {
	const name_dialog = document.getElementById('name-dialog') as HTMLDialogElement
	const name_input = document.getElementById('name-input') as HTMLInputElement
	const name_span = document.getElementById('name') as HTMLSpanElement


	const show_name_dialog = () => {
		window.remote_close_menu()

		name_input.value = ''
		name_dialog.inert = true
		name_dialog.showModal()
		name_dialog.inert = false
	}
	window.remote_open_name_dialog = show_name_dialog


	let current_name = '(no name)'
	const set_name = (new_name: string) => {
		new_name = Config.filter_name(new_name)
		if (new_name.length > 0) {
			current_name = new_name
		}
		name_span.textContent = new_name
		sessionStorage.setItem(Config.NAME_STORAGE_KEY, current_name)
		plugin.remote.send(plugin.remote.protocol.name(current_name))
	}

	name_dialog.addEventListener('close', (ev) => {
		set_name(name_input.value)
		window.scroll({ left: 0, top: 0, })
	})



	// ----- Init -----
	// Load saved name or show a dialog if one was not found
	const stored_name = sessionStorage.getItem(Config.NAME_STORAGE_KEY)
	if (stored_name)
		set_name(stored_name)
	else
		show_name_dialog()
}
