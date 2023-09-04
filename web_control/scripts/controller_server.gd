class_name ControllerServer extends WebSocketServer

signal controller_added(session_id: int)
signal controller_removed(session_id: int)

@onready var api: API = JsonAPI.new()

## Peer ID (int) to Client
var _clients: Dictionary = {}
## Session ID (int) to Controller
var _controllers: Dictionary = {}

func _ready() -> void:
	#super._ready()
	client_connected.connect(_on_client_connected)
	client_disconnected.connect(_on_client_disconnected)
	message_received.connect(api.handle_packet)

func stop() -> void:
	super.stop()
	_clients.clear()
	#_controllers.clear()

func try_get_client(peer_id: int) -> Client:
	if not _clients.has(peer_id): return null
	return _clients[peer_id]

func try_get_controller(session_id: int) -> Controller:
	if not _controllers.has(session_id): return null
	return _controllers[session_id]

func add_controller(session_id: int) -> Controller:
	assert(not _controllers.has(session_id), str('Cannot add controller. A controller with session id #', session_id,' already exists.'))

	var controller := Controller.new(session_id)
	_controllers[session_id] = controller
	controller_added.emit(session_id)

	# TEMPORARY: Setup testing SNES layout
	controller.clear_inputs()
	controller.register_input(&'a', false)
	controller.register_input(&'b', false)
	controller.register_input(&'x', false)
	controller.register_input(&'y', false)
	controller.register_input(&'l', Vector2.ZERO)
	return controller

func remove_controller(session_id: int) -> void:
	assert(not _controllers.has(session_id), str('Cannot remove controller. A controller with session id #', session_id,' does not exist.'))

	controller_removed.emit(session_id)
	_controllers.erase(session_id)

## Returns true of the controller was transfered from another client
func assigned_controller_to_client(session_id: int, peer_id: int) -> void:
	var controller := try_get_controller(session_id)
	assert(controller, str('Cannot assign controller to client. Could not find controller with session id #',session_id,'.'))

	var old_peer_id := controller.peer_id

	if controller.is_connected:
		controller.is_connected = false
		controller.connection_changed.emit(false)

		if old_peer_id > 1:
			var old_client: Client = _clients[old_peer_id]
			old_client.is_assigned = false
			old_client.assignment_changed.emit(false)
			send_kick(old_peer_id, 'Someone else took over this controller.')
	
	var new_client: Client = _clients[peer_id]
	new_client.is_assigned = true
	controller.is_connected = true
	new_client.assignment_changed.emit(true)
	controller.client_changed.emit(old_peer_id, peer_id)
	controller.connection_changed.emit(true)

func remove_idle_controllers() -> void:
	for session_id in _controllers:
		var controller: Controller = _controllers[session_id]
		if controller.is_connected: continue
		remove_controller(session_id)

func _on_client_connected(peer_id: int) -> void:
	var client := Client.new(peer_id)
	_clients[peer_id] = client

func _on_client_disconnected(peer_id: int) -> void:
	var client: Client = _clients[peer_id]
	_clients.erase(peer_id)
	
	if not client.is_assigned: return
	var controller: Controller = _controllers[client.session_id]
	controller.peer_id = 0
	controller.is_connected = false
	controller.connection_changed.emit(false)
	controller.client_changed.emit(peer_id, 0)

func receive_ping(peer_id: int, sts: int) -> void:
	send_pong(peer_id, sts)

func receive_pong(peer_id: int, sts: int, rts: int) -> void:
	var timestamp := Time.get_ticks_msec()
	var ping_ms = timestamp - sts
	var client: Client = _clients[peer_id]
	
	client.last_ping_ms = ping_ms
	client.ping_sum += ping_ms
	client.ping_count += 1
	client.avg_ping_ms = client.ping_sum/client.ping_count
	client.is_awaiting_ping = false
	client.last_heartbeat_timestamp = timestamp

## Returns true if successful
func set_input(peer_id: int, id: Variant, value: Variant) -> bool:
	var client: Client = _clients[peer_id]
	if not client.is_assigned:
		printerr('Can not set input. The client sending the input packet is assigned to a controller.')
		return false
	
	var controller: Controller = _controllers[client.session_id]
	
	# If the id is a binary index then find the name of it
	if typeof(id) == TYPE_INT:
		id = controller.get_input_id_from_index(id)
	
	if typeof(id) != TYPE_STRING:
		printerr('Can not set input. The id is invalid.')
		return false
	return controller.set_input(id, value)

func receive_btn(peer_id: int, id: Variant, down: bool) -> void:
	set_input(peer_id, id, down)

func receive_axis(peer_id: int, id: Variant, value: float) -> void:
	set_input(peer_id, id, value)

func receive_joy(peer_id: int, id: Variant, x: float, y: float) -> void:
	set_input(peer_id, id, Vector2(x, y))

func receive_name(peer_id: int, username: String) -> void:
	var client: Client = _clients[peer_id]
	if not client.is_assigned: return
	
	var controller := try_get_controller(client.sid)
	controller.username = username
	controller.username_changed.emit(username)

func receive_session(peer_id: int, session_id: int) -> void:
	if not _controllers.has(session_id):
		add_controller(session_id)
	
	assigned_controller_to_client(peer_id, session_id)
	
	return # Ignore old code
	var client: Client = _clients[peer_id]
	client.session_id = session_id
	
	if _controllers.has(session_id):
		print('Transfering #',peer_id,' with session #',session_id,' to an old controller.')
		
		var controller: Controller = _controllers[session_id]
		var old_peer_id = controller.peer_id
		controller.peer_id = peer_id
		controller.is_connected = true
		client.is_assigned = true
		client.assignment_changed.emit(true)
		controller.client_changed.emit(old_peer_id, peer_id)
		controller.connection_changed.emit(true)
		
		if old_peer_id > 1:
			send_kick(old_peer_id, 'Someone else took over this controller.')
		return
	
	print('Connecting #',peer_id,' with session #',session_id,' to a new controller.')
	
	var controller := add_controller(session_id)
	controller.peer_id = peer_id
	controller.is_connected = true
	client.is_assigned = true
	client.assignment_changed.emit(true)
	controller_added.emit(session_id)
	controller.client_changed.emit(0, peer_id)
	controller.connection_changed.emit(true)
	_controllers[session_id] = controller

func send_kick(peer_id: int, reason: String) -> void:
	close_socket(peer_id)
	_clients.erase(peer_id)

func send_ping(peer_id: int) -> void:
	var client: Client = _clients[peer_id]
	client.is_awaiting_ping = true

func send_pong(peer_id: int, sts: int) -> void:
	pass

func _process(delta: float) -> void:
	super._process(delta)
