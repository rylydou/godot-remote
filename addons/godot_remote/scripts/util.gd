extends RefCounted


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
