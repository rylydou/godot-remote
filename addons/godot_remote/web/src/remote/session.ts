import { Config } from '.'


export function get_session_id(generate_new = false): number {
	let session_id = Number(sessionStorage.getItem(Config.SESSION_STORAGE_KEY))
	if (!session_id || generate_new) {
		session_id = new_id()
		sessionStorage.setItem(Config.SESSION_STORAGE_KEY, session_id.toString())
	}
	return session_id
}


export function new_id(): number {
	return Math.floor(Math.random() * 899_999) + 100_000

	// const data = new DataView(crypto.getRandomValues(new Uint8Array(4)).buffer)
	// return data.getInt32(0)
}
