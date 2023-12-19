import { RemotePlugin } from '..'


export const menu = (plugin: RemotePlugin): void => {
	let is_menu_open = false


	const update_menu = () => {
		document.body.classList.toggle('menu-open', is_menu_open)
	}

	const open_menu = () => {
		is_menu_open = true
		update_menu()
	}
	window.remote_open_menu = open_menu

	const close_menu = () => {
		is_menu_open = false
		update_menu()
	}
	window.remote_close_menu = close_menu


	plugin.pointer_down = (pid, px, py) => {
		window.scroll({ left: 0, top: 0, })
		if (!is_menu_open) return false
		close_menu()
		return true
	}


	// Init
	close_menu()
}


// interface Window
