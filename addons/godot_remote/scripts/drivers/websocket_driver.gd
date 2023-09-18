# Based from: https://github.com/godotengine/godot-demo-projects/blob/e9f0f75c5ba0fe81197b35f31c73e09a70be5054/networking/websocket_chat/websocket/WebSocketServer.gd
extends 'res://addons/godot_remote/scripts/types/driver.gd'

@export var handshake_headers: PackedStringArray = []
@export var supported_protocols: PackedStringArray = []
@export var handshake_timout := 3000
@export var use_tls := false
@export var tls_cert: X509Certificate
@export var tls_key: CryptoKey
@export var refuse_new_connections := false:
	set(refuse):
		if refuse:
			pending_peers.clear()

class PendingPeer:
	var connect_time: int
	var tcp: StreamPeerTCP
	var connection: StreamPeer
	var ws: WebSocketPeer
	
	func _init(p_tcp: StreamPeerTCP):
		tcp = p_tcp
		connection = p_tcp
		connect_time = Time.get_ticks_msec()

var tcp_server := TCPServer.new()
var pending_peers: Array[PendingPeer] = []
var peers: Dictionary = {}

func build_http(http_server: HttpServer, file_router: HttpFileRouter) -> void:
	file_router.secrets['$_DRIVER_$'] = 'WebSocket'

func start(port: int) -> int:
	if tcp_server.is_listening():
		tcp_server.stop()
	
	return tcp_server.listen(port)

func stop():
	tcp_server.stop()
	pending_peers.clear()
	peers.clear()

func send_reliable(peer_id: int, message: Variant) -> int:
	assert(peers.has(peer_id), str('[WebSocket] Cannot send packed. A peer with peer_id #',peer_id,' does not exist.'))
	var ws = peers[peer_id]
	
	if typeof(message) == TYPE_STRING:
		return ws.send_text(message)
	return ws.send(message)

func send_unreliable(peer_id: int, message: Variant) -> int:
	return send_reliable(peer_id, message)

func get_message(peer_id: int) -> Variant:
	assert(peers.has(peer_id), str('[WebSocket] Cannot get message. A peer with peer_id #',peer_id,' does not exist.'))
	var ws = peers[peer_id]
	
	if ws.get_available_packet_count() <= 0: return null
	var packet = ws.get_packet()
	
	if ws.was_string_packet():
		return packet.get_string_from_utf8()
	return packet

func has_message(peer_id: int) -> bool:
	assert(peers.has(peer_id), str('[WebSocket] Cannot get message. A peer with peer_id #',peer_id,' does not exist.'))
	return peers[peer_id].get_available_packet_count() > 0

func _create_peer() -> WebSocketPeer:
	var ws := WebSocketPeer.new()
	ws.supported_protocols = supported_protocols
	ws.handshake_headers = handshake_headers
	return ws

func poll() -> void:
	if not tcp_server.is_listening():
		return
	
	while not refuse_new_connections and tcp_server.is_connection_available():
		var connection = tcp_server.take_connection()
		assert(connection != null)
		pending_peers.append(PendingPeer.new(connection))
	
	var to_remove := []
	for peer in pending_peers:
		if not _connect_pending(peer):
			if peer.connect_time + handshake_timout < Time.get_ticks_msec():
				# Timeout
				to_remove.append(peer)
			continue # Still pending
		to_remove.append(peer)
	for r in to_remove:
		pending_peers.erase(r)
	to_remove.clear()
	
	for peer_id in peers:
		var peer: WebSocketPeer = peers[peer_id]
		peer.poll()
		if peer.get_ready_state() != WebSocketPeer.STATE_OPEN:
			client_disconnected.emit(peer_id)
			to_remove.append(peer_id)
			continue
		while peer.get_available_packet_count():
			message_received.emit(peer_id, get_message(peer_id))
	
	for r in to_remove:
		peers.erase(r)
	to_remove.clear()

func _connect_pending(peer: PendingPeer) -> bool:
	if peer.ws != null:
		# Poll websocket client if doing handshake
		peer.ws.poll()
		var state = peer.ws.get_ready_state()
		if state == WebSocketPeer.STATE_OPEN:
			var peer_id = new_peer_id()
			peers[peer_id] = peer.ws
			client_connected.emit(peer_id)
			return true # Success.
		elif state != WebSocketPeer.STATE_CONNECTING:
			return true # Failure.
		return false # Still connecting.
	elif peer.tcp.get_status() != StreamPeerTCP.STATUS_CONNECTED:
		return true # TCP disconnected.
	elif not use_tls:
		# TCP is ready, create WS peer
		peer.ws = _create_peer()
		peer.ws.accept_stream(peer.tcp)
		return false # WebSocketPeer connection is pending.
	else:
		if peer.connection == peer.tcp:
			assert(tls_key != null and tls_cert != null)
			var tls = StreamPeerTLS.new()
			tls.accept_stream(peer.tcp, TLSOptions.server(tls_key, tls_cert))
			peer.connection = tls
		peer.connection.poll()
		var status = peer.connection.get_status()
		if status == StreamPeerTLS.STATUS_CONNECTED:
			peer.ws = _create_peer()
			peer.ws.accept_stream(peer.connection)
			return false # WebSocketPeer connection is pending.
		if status != StreamPeerTLS.STATUS_HANDSHAKING:
			return true # Failure.
		return false

func disconnect_peer(peer_id: int, reason: String = '') -> void:
	var ws: WebSocketPeer = peers[peer_id]
	ws.close(1000, reason)
	peers.erase(peer_id)
	client_disconnected.emit(peer_id)
