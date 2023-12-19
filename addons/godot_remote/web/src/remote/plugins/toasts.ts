import { RemotePlugin } from '..'


export const toasts = (plugin: RemotePlugin): void => {
	const spinner_element = document.getElementById('spinner') as HTMLElement
	const reload_element = document.getElementById('reload') as HTMLElement


	plugin.connected = () => {
		spinner_element.style.visibility = 'hidden'
		reload_element.style.visibility = 'hidden'
	}

	plugin.disconnected = () => {
		spinner_element.style.visibility = 'hidden'
		reload_element.style.visibility = 'visible'
	}

	plugin.connection_regained = () => {
		spinner_element.style.visibility = 'hidden'
		reload_element.style.visibility = 'hidden'
	}

	plugin.connection_dropped = () => {
		spinner_element.style.visibility = 'hidden'
		reload_element.style.visibility = 'visible'
	}


	// ----- Init -----
	spinner_element.style.visibility = 'visible'
	reload_element.style.visibility = 'hidden'
	// reload_element.style.visibility = 'visible'
}
