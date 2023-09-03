class_name ControllerServer extends WebSocketServer

## Peer ID (int) to Client
var clients: Dictionary = {}
## Session ID (int) to Controller
var controllers: Dictionary = {}

func _ready() -> void:
	#super._ready()
	client_connected.connect(_on_client_connected)
	client_disconnected.connect(_on_client_disconnected)

func stop() -> void:
	super.stop()
	clients.clear()
	#controllers.clear()

func _on_client_connected(peer_id: int) -> void:
	var client := Client.new(peer_id)
	clients[peer_id] = client

func _on_client_disconnected(peer_id: int) -> void:
	var client: Client = clients[peer_id]
	clients.erase(peer_id)
	
	if not client.is_assigned: return
	var controller: Controller = controllers[client.session_id]
	controller.peer_id = 0
	controller.is_connected = false

func receive_ping(peer_id: int, sts: int) -> void:
	send_pong(peer_id, sts)

func receive_pong(peer_id: int, sts: int, rts: int) -> void:
	var timestamp := Time.get_ticks_msec()
	var ping_ms = timestamp - sts
	var client: Client = clients[peer_id]
	
	client.last_ping_ms = ping_ms
	client.ping_sum += ping_ms
	client.ping_count += 1
	client.avg_ping_ms = client.ping_sum/client.ping_count
	client.is_awaiting_ping = false
	client.last_heartbeat_timestamp = timestamp

func receive_btn(peer_id: int, id: Variant, down: bool) -> void:
	pass

func receive_axis(peer_id: int, id: Variant, value: float) -> void:
	pass

func receive_joy(peer_id: int, id: Variant, x: float, y: float) -> void:
	pass

func receive_name(peer_id: int, username: String) -> void:
	var client: Client = clients[peer_id]
	if not client.is_assigned: return

	var controller: Controller = controllers[client.sid]
	controller.username = username

func receive_session(peer_id: int, session_id: int) -> void:
	var client: Client = clients[peer_id]
	client.session_id = session_id
	
	if controllers.has(session_id):
		print('Transfering #',peer_id,' with session #',session_id,' to an old controller.')
		
		var controller: Controller = controllers[session_id]
		var previous_peer_id = controller.peer_id
		controller.peer_id = peer_id
		controller.is_connected = true
		client.is_assigned = true
		
		if previous_peer_id > 1:
			send_kick(previous_peer_id, 'Someone else took over this controller.')
		return
	
	print('Connecting #',peer_id,' with session #',session_id,' to a new controller.')
	
	var controller := Controller.new(session_id)
	controllers[session_id] = controller
	controller.peer_id = peer_id
	client.is_assigned = true

func send_kick(peer_id: int, reason: String) -> void:
	close_socket(peer_id)
	clients.erase(peer_id)

func send_ping(peer_id: int) -> void:
	var client: Client = clients[peer_id]
	client.is_awaiting_ping = true

func send_pong(peer_id: int, sts: int) -> void:
	pass

func _process(delta: float) -> void:
	super._process(delta)
