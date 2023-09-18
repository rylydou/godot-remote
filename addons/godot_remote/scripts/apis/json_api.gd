extends 'res://addons/godot_remote/scripts/types/api.gd'

func handle_packet(peer_id: int, data: Variant) -> void:
	# prints(peer_id, data)
	if typeof(data) != TYPE_STRING: return
	var text := data as String
	
	var json = JSON.parse_string(text)
	if not json: return
	
	var dict: Dictionary = json
	
	if not dict.has('_'): return
	var type = str(dict['_'])
	
	match type:
		'ping':
			if not dict.has('sts'): return
			var sts: int = dict['sts'] # TYPE TRUST
			receive_ping.emit(peer_id, sts)
		'pong':
			if not dict.has('sts'): return
			if not dict.has('rts'): return
			var sts: int = dict['sts'] # TYPE TRUST
			var rts: int = dict['rts'] # TYPE TRUST
			receive_pong.emit(peer_id, sts, rts)
		'input': _handle_input_packet(peer_id, dict)
		'name':
			if not dict.has('name'): return
			var username := str(dict['name'])
			receive_name.emit(peer_id, username)
		'session':
			if not dict.has('sid'): return
			var session_id: int = dict['sid'] # TYPE TRUST
			receive_session.emit(peer_id, session_id)
		_: print('[JSON API] Unknown packet type from #',peer_id,': ', type)

func _handle_input_packet(peer_id: int, dict: Dictionary) -> void:
	if not dict.has('id'): return
	var id := str(dict['id'])
	
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
	if not dict.has('d'): return
	var down: bool = dict['d'] # TYPE TRUST
	receive_input_btn.emit(peer_id, id, down)

func _handle_axis_input(peer_id: int, dict: Dictionary, id: String) -> void:
	if not dict.has('v'): return
	var value: float = dict['v'] # TYPE TRUST
	receive_input_axis.emit(peer_id, id, value)

func _handle_joy_input(peer_id: int, dict: Dictionary, id: String) -> void:
	if not dict.has('x'): return
	if not dict.has('y'): return
	var x: float = dict['x'] # TYPE TRUST
	var y: float = dict['y'] # TYPE TRUST
	receive_input_joy.emit(peer_id, id, x, y)

# ---------------------------------------------------------------------------- #

func send_json_reliable(peer_id: int, data: Variant) -> void:
	send_reliable.emit(peer_id, JSON.stringify(data))

func send_json_unreliable(peer_id: int, data: Variant) -> void:
	send_unreliable.emit(peer_id, JSON.stringify(data))

func send_ping(peer_id: int, sts: int) -> void:
	send_json_reliable(peer_id, {
		'_': 'ping',
		'sts': sts,
	})

func send_pong(peer_id: int, sts: int, rts: int) -> void:
	send_json_reliable(peer_id, {
		'_': 'pong',
		'sts': sts,
		'rts': rts,
	})
