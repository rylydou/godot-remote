extends 'res://addons/godot_remote/scripts/types/driver.gd'

@export var handshake_timeout := 3000

var _my_peer: WebRTCPeerConnection
var _my_send_channel: WebRTCDataChannel

var _peers: Dictionary = {}
var _reliable_receive_channels: Dictionary = {}
var _unreliable_receive_channels: Dictionary = {}

func start(port: int) -> int:
	_my_peer = WebRTCPeerConnection.new()
	_my_peer.session_description_created.connect(_on_session_description_created)
	
	var options = {
		'negotiated': true,
		'id': 1,
	}
	_my_send_channel = _my_peer.create_data_channel('reliable', options)
	
	print('[WebRTC] Create offer: ',error_string(_my_peer.create_offer()))
	
	return OK

func _on_session_description_created(type: String, sdp: String) -> void:
	print('[WebRTC] Session description created: type=',type,' sdp=',sdp)

func _create_peer(peer_id: int) -> WebRTCPeerConnection:
	var peer := WebRTCPeerConnection.new()
	_peers[peer_id] = peer
	
	var options = {
		'negotiated': true,
		'id': 1,
	}
	var reliable_receive_channel = peer.create_data_channel('reliable')
	_reliable_receive_channels[peer_id] = reliable_receive_channel
	
	options = {
		'negotiated': true,
		'id': 2,
		'maxRetransmits': 0,
		'ordered': false,
	}
	var unreliable_receive_channel = peer.create_data_channel('unreliable')
	_unreliable_receive_channels[peer_id] = unreliable_receive_channel
	
	return peer

func poll() -> void:
	_my_peer.poll()
	
	for peer_id in _peers:
		var peer: WebRTCPeerConnection = _peers[peer_id]
		peer.poll()
