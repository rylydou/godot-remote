extends RefCounted


# Feel free to edit this function
static func filter_name(name: String) -> String:
	const MAX_LENGTH := 10
	const ALLOWED_CHARS := ' ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	
	name = name.to_upper()
	
	var result := PackedStringArray()
	var was_space := true # Starts true to trim preceding spaces
	for chr in name:
		# Max of 10 characters
		if result.size() >= MAX_LENGTH: break
		
		var is_space = chr == ' '
		# Only one space at a time
		if is_space and was_space: continue
		# Only allowed characters
		if not ALLOWED_CHARS.contains(chr): continue
		
		# Everything is fine, add it to the name
		result.append(chr)
		was_space = is_space
	
	# Avoid crash
	if result.size() <= 0: return ''
	
	# Remove trailing space
	if result[-1] == ' ':
		result.remove_at(result.size() - 1)
	
	return ''.join(result)


static func find_open_port(port: int, max_retries: int, start_server: Callable) -> int:
	for i in range(max_retries):
		var err: int = start_server.call(port)
		match err:
			OK: return port
			ERR_ALREADY_IN_USE:
				port += 1
				continue
			_: return -1
	return -1
