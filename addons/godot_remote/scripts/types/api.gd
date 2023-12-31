extends RefCounted

signal send_reliable(peer_id: int, data: Variant)
signal send_unreliable(peer_id: int, data: Variant)


func handle_packet(peer_id: int, data: Variant) -> void:
	pass


func get_time_msec() -> int:
	var datetime_dict := Time.get_time_dict_from_system(true)
	return Time.get_unix_time_from_datetime_dict(datetime_dict)


signal receive_ping(peer_id: int, timestamp: int)
signal receive_pong(peer_id: int, timestamp: int)
signal receive_session(peer_id: int, sid: int)
signal receive_name(peer_id: int, id: Variant, name: String)
signal receive_leave(peer_id: int)
signal receive_layout_ready(peer_id: int, id: StringName)

signal receive_input_btn(peer_id: int, id: Variant, down: bool)
signal receive_input_joy(peer_id: int, id: Variant, x: float, y: float, t: int)


func send_ping(peer_id: int, timestamp: int) -> void:
	pass
func send_pong(peer_id: int, timestamp: int) -> void:
	pass
func send_sync(peer_id: int, id: StringName) -> void:
	pass
func send_sync_all(peer_id: int) -> void:
	pass
func send_layout(peer_id: int, id: StringName) -> void:
	pass
func send_alert(peer_id: int, title: String, body: String) -> void:
	pass
func send_banner(peer_id: int, text: String) -> void:
	pass
func send_clear_banner(peer_id: int) -> void:
	pass
