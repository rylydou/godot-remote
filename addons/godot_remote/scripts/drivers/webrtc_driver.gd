extends 'res://addons/godot_remote/scripts/types/driver.gd'

const OfferRouter = preload('res://addons/godot_remote/scripts/routers/webrtc_offer_router.gd')
const IceRouter = preload('res://addons/godot_remote/scripts/routers/webrtc_ice_router.gd')

@export var handshake_timeout := 3000

var _offer_router := OfferRouter.new(self)
var _ice_router := IceRouter.new(self)

class Peer:
	var peer_id: int
	var connection: WebRTCPeerConnection
	var reliable_channel: WebRTCDataChannel 
	var unreliable_channel: WebRTCDataChannel

# peer id (int) to Peer
var _peers: Dictionary = {}

var tree: SceneTree
func build_http(http_server: HttpServer, file_router: HttpFileRouter) -> void:
	tree = http_server.get_tree()
	http_server.register_router('/webrtc/offer', _offer_router)
	http_server.register_router('/webrtc/ice', _ice_router)
	file_router.secrets['$_DRIVER_$'] = 'WebRTC'

func start(port: int) -> int:
	return OK

func handle_offer(response: HttpResponse, offer_type: String, offer_sdp: String) -> void:
	var ice_ufrag := Marshalls.variant_to_base64(randi())
	offer_sdp += 'a=ice-ufrag:OEYM\n'
	offer_sdp += 'a=ice-pwd:qNDeUaLr+5WZ8HIU7oFSxS\n'
	offer_sdp += 'a=ice-options:ice2,trickle\n'
	offer_sdp += 'm=application 9 UDP/DTLS/SCTP webrtc-datachannel\n'
	
	print('[WebRTC] Offer type=',offer_type,' sdp=',offer_sdp)
	var peer := _create_peer()
	var peer_id := new_peer_id()
	peer.peer_id = peer_id
	_peers[peer_id] = peer
	
	peer.connection.session_description_created.connect(
		func(answer_type, answer_sdp):
			_on_session_description_created(response, peer, answer_type, answer_sdp)
			, Node.CONNECT_ONE_SHOT)
	
	var err = peer.connection.set_remote_description(offer_type, offer_sdp)
	print('[WebRTC] set_remote_description: ', error_string(err))

func _on_session_description_created(response: HttpResponse, peer: Peer, answer_type: String, answer_sdp: String) -> void:
	print('[WebRTC] Answer type=',answer_type,' sdp=',answer_sdp)
	var err := peer.connection.set_local_description(answer_type, answer_sdp)
	print('[WebRTC] set_local_description: ', error_string(err))
	response.json(200, {
		'peer_id': peer.peer_id,
		'type': answer_type,
		'sdp': answer_sdp,
	})

func handle_ice(response: HttpResponse, peer_id: int, candidate: String) -> void:
	var peer = _peers[peer_id]
	
	print('[WebRTC] Received ice candidate from #',peer_id,': ',candidate)
	peer.connection.add_ice_candidate('0', 0, candidate)

func _create_peer() -> Peer:
	var peer := Peer.new()
	peer.connection = WebRTCPeerConnection.new()
	peer.connection.initialize({
		"iceServers": [ { "urls": ["stun:stun.l.google.com:19302"] } ]
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
	for peer_id in _peers:
		var peer: Peer = _peers[peer_id]
		peer.connection.poll()
