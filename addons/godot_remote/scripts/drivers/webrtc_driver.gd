extends 'res://addons/godot_remote/scripts/types/driver.gd'


const WebSocketDriver = preload('res://addons/godot_remote/scripts/drivers/websocket_driver.gd')


class Peer:
	var peer_id: int
	var connection: WebRTCPeerConnection
	var reliable_channel: WebRTCDataChannel
	var unreliable_channel: WebRTCLibDataChannel


@export var handshake_timeout := 3000


var _wss := WebSocketDriver.new()


# peer id (int) to Peer
var _peers: Dictionary = {}


var tree: SceneTree
func build_http(http_server: HttpServer, file_router: HttpFileRouter) -> void:
	tree = http_server.get_tree()
	file_router.secrets['$_DRIVER_$'] = 'RTC'


func start(port: int) -> int:
	_wss.client_connected.connect(_on_client_connected)
	_wss.client_disconnected.connect(_on_client_disconnected)
	_wss.message_received.connect(_on_message_received)
	_wss.start(port)
	return OK


func _on_client_connected(peer_id: int) -> void:
	print('[RTC] Creating client #',peer_id)
	var peer := _create_peer()
	peer.peer_id = peer_id
	_peers[peer_id] = peer
	
	peer.connection.session_description_created.connect(
	func(answer_type, answer_sdp):
		_on_session_description_created(peer, answer_type, answer_sdp)
	)
	
	peer.connection.ice_candidate_created.connect(
	func(media: String, index: int, name: String):
		_on_ice_candidate_created(peer, media, index, name)
	)
	
	_wss.send_reliable(peer_id, JSON.stringify({
		'_': 'ready',
		'peer_id': peer_id,
	}))


func _on_client_disconnected(peer_id: int) -> void:
	print('[RTC] Removing client #',peer_id)
	var peer: Peer = _peers[peer_id]
	_peers.erase(peer_id)
	peer.unreliable_channel.close()
	peer.reliable_channel.close()
	peer.connection.close()


func _on_message_received(peer_id: int, message: Variant) -> void:
	var dict: Dictionary = JSON.parse_string(message)
	var type: String = dict['_']
	match type:
		'description': handle_description(peer_id, dict['type'], dict['sdp'])
		'candidate': handle_candidate(peer_id, dict['candidate'], dict['sdp_mid'], dict['sdp_index'])
		_: printerr('[RTC] Unknown signal type: ',type)


func handle_description(peer_id: int, type: String, sdp: String) -> void:
	print('[RTC] Received Description: type=',type,' sdp=',sdp)
	var peer: Peer = _peers[peer_id]
	var err = peer.connection.set_remote_description(type, sdp)
	print('[RTC] set_remote_description: ',error_string(err))


func handle_candidate(peer_id: int, candidate: String, sdp_mid: String, sdp_index: int) -> void:
	print('[RTC] Received Candidate: sdp_mid=',sdp_mid,' sdp_index=',sdp_index,' candidate=',candidate)
	var peer: Peer = _peers[peer_id]
	var err = peer.connection.add_ice_candidate(candidate, sdp_index, sdp_mid)
	print('[RTC] add_ice_candidate: ',error_string(err))


func _on_session_description_created(peer: Peer, type: String, sdp: String) -> void:
	print('[RTC] Created Description: type=',type,' sdp=',sdp)
	var err := peer.connection.set_local_description(type, sdp)
	print('[RTC] set_local_description: ',error_string(err))
	_wss.send_reliable(peer.peer_id, JSON.stringify({
		'_': 'description',
		'sdp': sdp,
		'type': type,
	}))


func _on_ice_candidate_created(peer: Peer, media: String, index: int, name: String) -> void:
	print('[RTC] Created Candidate: media=',media,' index=',index,' name=',name)
	_wss.send_reliable(peer.peer_id, JSON.stringify({
		'_': 'candidate',
		'candidate': name,
		'sdp_mid': media,
		'sdp_index': index,
	}))


func _create_peer() -> Peer:
	var peer := Peer.new()
	peer.connection = WebRTCPeerConnection.new()
	# peer.connection.
	peer.connection.initialize({
		"iceServers": [
			{ "urls": [ "stun:stun.l.google.com:19302" ], },
		],
	})
	
	peer.reliable_channel = peer.connection.create_data_channel('reliable', {
		'negotiated': true,
		'id': 1,
	})
	
	peer.unreliable_channel = peer.connection.create_data_channel('unreliable', {
		'negotiated': true,
		'id': 2,
		'maxRetransmits': 0,
		'ordered': false,
	})
	
	return peer


func poll() -> void:
	_wss.poll()
	
	for peer_id in _peers:
		var peer: Peer = _peers[peer_id]
		peer.connection.poll()
