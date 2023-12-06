extends 'res://addons/godot_remote/scripts/types/driver.gd'


const WebSocketDriver = preload('res://addons/godot_remote/scripts/drivers/websocket_driver.gd')
const RTCDriver = preload('res://addons/godot_remote/cs/WebRTCDriver.cs')


@export var handshake_timeout := 3000


var _wss := WebSocketDriver.new()
var _rtc_driver = RTCDriver.new()


func build_http(http_server: HttpServer, file_router: HttpFileRouter) -> void:
	file_router.secrets['$_CLIENT_$'] = 'RTC'


func start(port: int) -> int:
	_wss.client_connected.connect(_on_client_connected)
	_wss.client_disconnected.connect(_on_client_disconnected)
	_wss.message_received.connect(_on_message_received)
	_wss.start(port)
	
	_rtc_driver.signaling_send_message.connect(func(peer_id, message): _wss.send_reliable(peer_id, message))
	
	return OK


func _on_client_connected(peer_id: int) -> void:
	print('[RTC] Creating client #',peer_id)
	_rtc_driver.signaling_peer_connected(peer_id)


func _on_client_disconnected(peer_id: int) -> void:
	print('[RTC] Removing client #',peer_id)
	_rtc_driver.signaling_peer_disconnected(peer_id)


func _on_message_received(peer_id: int, message: Variant) -> void:
	var dict: Dictionary = JSON.parse_string(message)
	var type: String = dict['_']
	match type:
		'description': _rtc_driver.signaling_description(peer_id, dict['type'], dict['sdp'])
		'candidate': _rtc_driver.signaling_candidate(peer_id, dict['candidate'])
		_: printerr('[RTC] Unknown signal type: ',type)


func poll() -> void:
	_wss.poll()
	_rtc_driver.poll()
