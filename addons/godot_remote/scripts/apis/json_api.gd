extends 'res://addons/godot_remote/scripts/types/api.gd'


func handle_packet(peer_id: int, data: Variant) -> void:
	if data is PackedByteArray:
		data = (data as PackedByteArray).get_string_from_utf8()
	
	# prints(peer_id, data)
	
	if typeof(data) != TYPE_STRING: return
	var text := data as String
	
	var json = JSON.parse_string(text)
	if not json: return
	
	var dict: Dictionary = json
	
	var type = dict.get('_')
	if not(type is String):
		printerr('[JSON] packet is missing type or it is wrong')
		return
	
	match type:
		'ping':
			var sts = dict.get('sts')
			if not(sts is float): return
			receive_ping.emit(peer_id, sts)
		
		'pong':
			var sts = dict.get('sts')
			var rts = dict.get('rts')
			if not(sts is float): return
			if not(rts is float): return
			receive_pong.emit(peer_id, sts, rts)
		
		'input':
			_handle_input_packet(peer_id, dict)
		
		'name':
			var username = dict.get('name')
			if not(username is String): return
			receive_name.emit(peer_id, username)
		
		'session':
			var session_id = dict.get('sid')
			if not(session_id is float): return
			receive_session.emit(peer_id, session_id)
		
		_: print('[JSON] unknown packet type from #',peer_id,': ',type)


func _handle_input_packet(peer_id: int, dict: Dictionary) -> void:
	var id = str(dict.get('id'))
	if not(id is String):
		printerr('input id is wrong: ', typeof(id))
		return
	
	# TODO: LAYOUT SYSTEM
	match id:
		'a': _handle_btn_input(peer_id, dict, id)
		'b': _handle_btn_input(peer_id, dict, id)
		'x': _handle_btn_input(peer_id, dict, id)
		'y': _handle_btn_input(peer_id, dict, id)
		
		'l': _handle_joy_input(peer_id, dict, id)
		'r': _handle_joy_input(peer_id, dict, id)
		
		_: print('[JSON API] Unknown input id from #',peer_id,': ', id)


func _handle_btn_input(peer_id: int, dict: Dictionary, id: String) -> void:
	var down = dict.get('d')
	if not(down is bool): return
	receive_input_btn.emit(peer_id, id, down)


func _handle_axis_input(peer_id: int, dict: Dictionary, id: String) -> void:
	var value = dict.get('v')
	if not(value is float): return
	receive_input_axis.emit(peer_id, id, value)


func _handle_joy_input(peer_id: int, dict: Dictionary, id: String) -> void:
	var x = dict.get('x')
	var y = dict.get('y')
	var t = dict.get('t', 0.0)
	if not(x is float and y is float and t is float): return
	receive_input_joy.emit(peer_id, id, x, y, t)

# ---------------------------------------------------------------------------- #

func send_json_reliable(peer_id: int, data: Variant) -> void:
	send_reliable.emit(peer_id, JSON.stringify(data))


func send_json_unreliable(peer_id: int, data: Variant) -> void:
	send_unreliable.emit(peer_id, JSON.stringify(data))


func send_ping(peer_id: int, sts: int) -> void:
	send_json_unreliable(peer_id, {
		'_': 'ping',
		'sts': sts,
	})


func send_pong(peer_id: int, sts: int, rts: int) -> void:
	send_json_unreliable(peer_id, {
		'_': 'pong',
		'sts': sts,
		'rts': rts,
	})
