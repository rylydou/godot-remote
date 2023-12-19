// Networking
export const PING_BTW_MS = 250
export const CONNECTION_DROPPED_MS = 3000


// Storage
export const STORAGE_KEY_PREFIX = 'gremote:'
export const SESSION_STORAGE_KEY = STORAGE_KEY_PREFIX + 'session_id'
export const NAME_STORAGE_KEY = STORAGE_KEY_PREFIX + 'name'


// Feel free to edit this function
export function filter_name(name: string): string {
	const MAX_LENGTH = 10
	const ALLOWED_CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ'

	name = name.toUpperCase()
	name.trim()

	let result: string[] = []
	let was_space = true // Starts true to trim preceding spaces
	for (const chr of name) {
		// Max of 10 characters
		if (result.length >= MAX_LENGTH) break

		const is_space = chr === ' '
		// Only one space at a time
		if (is_space && was_space) continue
		// Only allowed characters
		if (ALLOWED_CHARS.indexOf(chr) < 0) continue

		// Everything is fine, add it to the name
		result.push(chr)
		was_space = is_space
	}

	return result.join('')
}
