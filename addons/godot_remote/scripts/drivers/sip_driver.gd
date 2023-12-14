extends 'res://addons/godot_remote/scripts/types/driver.gd'


const WebSocketDriver = preload('res://addons/godot_remote/scripts/drivers/websocket_driver.gd')
const InternalSIPDriver = preload('res://addons/godot_remote/cs/InternalSIPDriver.cs')


@export var handshake_timeout := 3000


var _wss := WebSocketDriver.new()
var _driver = InternalSIPDriver.new()


func build_http(http_server: HttpServer, file_router: HttpFileRouter) -> void:
	file_router.secrets['$_CLIENT_$'] = 'RTC'


func start(port: int) -> int:
	_wss.client_connected.connect(_on_client_connected)
	_wss.client_disconnected.connect(_on_client_disconnected)
	_wss.message_received.connect(_on_message_received)
	_wss.start(port)
	
	_driver.signaling_send_message.connect(func(peer_id, message): _wss.send_reliable(peer_id, message))
	
	_driver.message_received.connect(func(peer_id, message): message_received.emit(peer_id, message))
	
	_driver.client_connected.connect(func(peer_id): client_connected.emit(peer_id))
	_driver.client_disconnected.connect(func(peer_id): client_disconnected.emit(peer_id))
	
	return OK


func _on_client_connected(peer_id: int) -> void:
	print('[RTC] Creating client #',peer_id)
	_driver.signaling_peer_connected(peer_id)


func _on_client_disconnected(peer_id: int) -> void:
	print('[RTC] Removing client #',peer_id)
	_driver.signaling_peer_disconnected(peer_id)


func _on_message_received(peer_id: int, message: Variant) -> void:
	var dict: Dictionary = JSON.parse_string(message)
	var type: String = dict['_']
	match type:
		'description': _driver.signaling_description(peer_id, dict['type'], dict['sdp'])
		'candidate': _driver.signaling_candidate(peer_id, dict['candidate'], dict['sdp_mid'], dict['sdp_index'], dict['ufrag'])
		_: printerr('[RTC] Unknown signal type: ',type)


func send_reliable(peer_id: int, message: Variant) -> int:
	return _driver.send_reliable(peer_id, message)


func send_unreliable(peer_id: int, message: Variant) -> int:
	return _driver.send_unreliable(peer_id, message)


func poll() -> void:
	_wss.poll()
	_driver.poll()
