extends RefCounted


signal message_received(peer_id: int, message: Variant)
signal client_connected(peer_id: int)
signal client_disconnected(peer_id: int)


func build_http(http_server: HttpServer, file_router: HttpFileRouter) -> void:
	pass

func start(port: int) -> int:
	return ERR_UNAVAILABLE

func stop() -> void:
	pass

func poll() -> void:
	pass

func send_reliable(peer_id: int, message: Variant) -> int:
	return ERR_UNAVAILABLE

func send_unreliable(peer_id: int, message: Variant) -> int:
	return ERR_UNAVAILABLE

func disconnect_peer(peer_id: int, reason: String = '') -> void:
	pass

func new_peer_id() -> int:
	return randi_range(100_000, 999_999)
