class_name JsonServer extends ControllerServer

func _ready() -> void:
	super._ready()
	message_received.connect(_on_message_received)

func _on_message_received(peer_id: int, message: Variant) -> void:
	if typeof(message) != TYPE_STRING: return
	var text_message := message as String
	
	#if not text_message.begins_with('{'): return
	#if not text_message.begins_with('}'): return
	
	var json = JSON.parse_string(text_message)
	if not json: return
	
	var dict: Dictionary = json
	
	if not dict.has('_'): return
	var type = str(dict['_'])
	
	match type:
		'ping':
			if not dict.has('sts'): return
			var sts: int = dict['sts'] # Type trust
			receive_ping(peer_id, sts)
		'pong':
			if not dict.has('sts'): return
			if not dict.has('rts'): return
			var sts: int = dict['sts'] # Type trust
			var rts: int = dict['rts'] # Type trust
			receive_pong(peer_id, sts, rts)
		'input': _handle_input_packet(peer_id, dict)
		'name':
			if not dict.has('name'): return
			var username := str(dict['name'])
			receive_name(peer_id, username)
		'session':
			if not dict.has('sid'): return
			var session_id: int = dict['sid'] # Type trust
			receive_session(peer_id, session_id)
		_: print('[Websocket JSON] Unknown packet type from #',peer_id,': ', type)

func _handle_input_packet(peer_id: int, dict: Dictionary) -> void:
	if not dict.has('id'): return
	var id := str(dict['id'])
	
	match id:
		'a': _handle_btn_input(peer_id, dict, id)
		'b': _handle_btn_input(peer_id, dict, id)
		'x': _handle_btn_input(peer_id, dict, id)
		'y': _handle_btn_input(peer_id, dict, id)
		
		'l': _handle_joy_input(peer_id, dict, id)
		'r': _handle_joy_input(peer_id, dict, id)
		
		_: print('[Websocket JSON] Unknown input id from #',peer_id,': ', id)

func _handle_btn_input(peer_id: int, dict: Dictionary, id: String) -> void:
	if not dict.has('d'): return
	var down: bool = dict['d'] # Type trust
	receive_btn(peer_id, id, down)

func _handle_axis_input(peer_id: int, dict: Dictionary, id: String) -> void:
	if not dict.has('v'): return
	var value: float = dict['v'] # Type trust
	receive_axis(peer_id, id, value)

func _handle_joy_input(peer_id: int, dict: Dictionary, id: String) -> void:
	if not dict.has('x'): return
	if not dict.has('y'): return
	var x: float = dict['x'] # Type trust
	var y: float = dict['y'] # Type trust
	receive_joy(peer_id, id, x, y)

func send_json(peer_id: int, data: Variant) -> void:
	send(peer_id, JSON.stringify(data))

func send_ping(peer_id: int) -> void:
	var timestamp := Time.get_ticks_msec()
	super.send_ping(peer_id)
	send_json(peer_id, {
		'sts': timestamp
	})

func send_pong(peer_id: int, sts: int) -> void:
	var timestamp := Time.get_ticks_msec()
	super.send_pong(peer_id, sts)
	send_json(peer_id, {
		'sts': sts,
		'rts': timestamp
	})

func send_kick(peer_id: int, reason: String) -> void:
	super.send_kick(peer_id, reason)
	send_json(peer_id, {
		'_': 'kick',
		'reason': reason,
	})
