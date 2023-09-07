class_name ControllerServer extends WebSocketServer

static var instance: ControllerServer = null

signal controller_added(session_id: int)
signal controller_removed(session_id: int)

@onready var api: API = JsonAPI.new()

## Peer ID (int) to Client
var _clients: Dictionary = {}
## Session ID (int) to Controller
var _controllers: Dictionary = {}

func _init() -> void:
	super._init()
	if not is_instance_valid(instance):
		instance = self

func _ready() -> void:
	#super._ready()
	client_connected.connect(_on_client_connected)
	client_disconnected.connect(_on_client_disconnected)
	message_received.connect(api.handle_packet)

	api.send_packet.connect(send)
	api.receive_ping.connect(_on_receive_ping)
	api.receive_pong.connect(_on_receive_pong)
	api.receive_input_btn.connect(_on_receive_input_btn)
	api.receive_input_axis.connect(_on_receive_input_axis)
	api.receive_input_joy.connect(_on_receive_input_joy)
	api.receive_name.connect(_on_receive_name)
	api.receive_session.connect(_on_receive_session)
	api.receive_layout_ready.connect(_on_receive_layout_ready)

func _process(delta: float) -> void:
	super._process(delta)

func stop() -> void:
	super.stop()
	_clients.clear()
	#_controllers.clear()

## Returns null if client is not found
func get_client(peer_id: int) -> Client:
	if not _clients.has(peer_id): return null
	return _clients[peer_id]

func kick_client(peer_id: int, reason: String) -> void:
	close_socket(peer_id, 1000, reason)
	_clients.erase(peer_id)

## Returns null if one is not found
func get_controller(session_id: int) -> Controller:
	if not _controllers.has(session_id): return null
	return _controllers[session_id]

func add_controller(session_id: int) -> Controller:
	assert(not _controllers.has(session_id), str('Cannot add controller. A controller with session id #', session_id,' already exists.'))

	var controller := Controller.new(session_id)
	_controllers[session_id] = controller
	controller_added.emit(session_id)

	# TODO: LAYOUT SYSTEM
	controller.clear_inputs()
	controller.register_input(&'a', false)
	controller.register_input(&'b', false)
	controller.register_input(&'x', false)
	controller.register_input(&'y', false)
	controller.register_input(&'l', Vector2.ZERO)
	return controller

func remove_controller(session_id: int) -> void:
	assert(_controllers.has(session_id), str('Cannot remove controller. A controller with session id #', session_id,' does not exist.'))

	controller_removed.emit(session_id)
	_controllers.erase(session_id)

func remove_idle_controllers() -> void:
	var to_remove: Array[int] = []
	for session_id in _controllers:
		var controller: Controller = _controllers[session_id]
		if controller.is_connected: continue
		if controller.peer_id != 0: continue
		to_remove.append(session_id)
	for session_id in to_remove:
		remove_controller(session_id)

## Returns true of the controller was transfered from another client
func assign_client_to_controller(peer_id: int, session_id: int) -> void:
	var controller := get_controller(session_id)
	assert(controller, str('Cannot assign controller to client. Could not find controller with session id #',session_id,'.'))

	var old_peer_id := controller.peer_id

	if controller.is_connected:
		controller.is_connected = false
		controller.connection_changed.emit(false)

		if old_peer_id > 1:
			var old_client: Client = _clients[old_peer_id]
			old_client.is_assigned = false
			old_client.assignment_changed.emit(false)
			kick_client(old_peer_id, 'Someone else took over this controller.')
	
	var new_client: Client = _clients[peer_id]
	new_client.is_assigned = true
	controller.is_connected = true
	new_client.assignment_changed.emit(true)
	controller.client_changed.emit(old_peer_id, peer_id)
	controller.connection_changed.emit(true)

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

func ping_client(peer_id: int) -> void:
	var client := get_client(peer_id)
	client.ongoing_pings += 1
	api.send_ping(peer_id, api.get_time_msec())

func _on_receive_ping(peer_id: int, sts: int) -> void:
	api.send_pong(peer_id, sts, api.get_time_msec())

func _on_receive_pong(peer_id: int, sts: int, rts: int) -> void:
	var timestamp := api.get_time_msec()
	var ping_ms = timestamp - sts
	var client := get_client(peer_id)
	
	client.last_ping_ms = ping_ms
	client.ping_sum += ping_ms
	client.ping_count += 1
	client.avg_ping_ms = client.ping_sum/client.ping_count
	client.ongoing_pings -= 1
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

func _on_receive_input_btn(peer_id: int, id: Variant, down: bool) -> void:
	set_input(peer_id, id, down)

func _on_receive_input_axis(peer_id: int, id: Variant, value: float) -> void:
	set_input(peer_id, id, value)

func _on_receive_input_joy(peer_id: int, id: Variant, x: float, y: float) -> void:
	set_input(peer_id, id, Vector2(x, y))

func _on_receive_name(peer_id: int, username: String) -> void:
	var client: Client = _clients[peer_id]
	if not client.is_assigned: return
	
	var controller := get_controller(client.sid)
	controller.username = username
	controller.username_changed.emit(username)

func _on_receive_session(peer_id: int, session_id: int) -> void:
	var client := get_client(peer_id)
	client.session_id = session_id

	if not _controllers.has(session_id):
		print('Adding a new controller for new client.')
		add_controller(session_id)
	
	assign_client_to_controller(peer_id, session_id)

func _on_receive_layout_ready(peer_id: int, id: StringName) -> void:
	pass
