extends RefCounted

signal message_received(peer_id: int, message: Variant)
signal client_connected(peer_id: int)
signal client_disconnected(peer_id: int)

func start(port: int) -> int:
	return ERR_UNAVAILABLE

func stop() -> void:
	pass

func poll() -> void:
	pass

func send(peer_id: int, message: Variant) -> int:
	return ERR_UNAVAILABLE

func disconnect_peer(peer_id: int, reason: String = '') -> void:
	pass

func new_peer_id() -> int:
	return randi_range(2, 1 << 30)

func get_driver_secret() -> String:
	return ''
