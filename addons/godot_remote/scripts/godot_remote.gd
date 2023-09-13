class_name GodotRemote extends Node

# Imports
const Util = preload('res://addons/godot_remote/scripts/util.gd')
const JsonAPI = preload('res://addons/godot_remote/scripts/apis/json_api.gd')
const API = preload('res://addons/godot_remote/scripts/types/api.gd')
const Client = preload('res://addons/godot_remote/scripts/types/client.gd')
const Controller = preload('res://addons/godot_remote/scripts/types/controller.gd')
const BtnInput = preload('res://addons/godot_remote/scripts/types/btn_input.gd')
const AxisInput = preload('res://addons/godot_remote/scripts/types/axis_input.gd')
const JoyInput = preload('res://addons/godot_remote/scripts/types/joy_input.gd')

enum InputHandleMode {
	Manual,
	Idle,
	Physics,
}

signal http_address_changed(address: String)
signal controller_added(session_id: int)
signal controller_removed(session_id: int)

@export var starting_port = 8080
@export var max_port_retries = 10
@export var input_handle_mode := InputHandleMode.Idle
var api: API = JsonAPI.new()

@export_group('HTTP Server', 'http_')
@export var http_server: HttpServer
@export_dir var http_public_folder := 'res://addons/godot_remote/web/dist'
var http_server_port: int
var http_server_address: String
var http_file_router: HttpFileRouter

@export_group('Websocket Server', 'ws_')
@export var ws_server: WebSocketServer
var ws_server_port: int
var ws_server_address: String
@export var ws_heartbeat_time := 1000

## Peer ID (int) to Client
var _clients: Dictionary = {}
## Session ID (int) to Controller
var _controllers: Dictionary = {}

var ip_address: String

func _ready() -> void:
	_connect_signals()
	
	var ip_addresses = IP.get_local_addresses()
	print('[Remote] Available IP addresses: ',ip_addresses)
	
	ip_address = str(ip_addresses[0])
	print('[Remote] Using IP address: ',ip_address)
	
	http_file_router = HttpFileRouter.new(http_public_folder)
	http_server.register_router('/*', http_file_router)
	
	start_servers()

func _connect_signals() -> void:
	ws_server.client_connected.connect(_on_client_connected)
	ws_server.client_disconnected.connect(_on_client_disconnected)
	ws_server.message_received.connect(api.handle_packet)

	api.send_packet.connect(func(peer_id: int, message: Variant): return ws_server.send(peer_id, message))
	api.receive_ping.connect(_on_receive_ping)
	api.receive_pong.connect(_on_receive_pong)
	api.receive_input_btn.connect(_on_receive_input_btn)
	api.receive_input_axis.connect(_on_receive_input_axis)
	api.receive_input_joy.connect(_on_receive_input_joy)
	api.receive_name.connect(_on_receive_name)
	api.receive_session.connect(_on_receive_session)
	api.receive_layout_ready.connect(_on_receive_layout_ready)

func start_servers() -> void:
	print('[Remote] Starting servers')
	var current_port = starting_port
	
	print('[HTTP] Finding port and starting')
	start_http_server(current_port, max_port_retries)
	
	print('[WebSocket] Finding port and starting')
	start_ws_server(current_port, max_port_retries)

func start_http_server(port: int, max_retries: int) -> void:
	http_server.stop()
	
	print('[HTTP] Finding an open port starting at: ',port)
	http_server_port = Util.find_open_port(port, max_retries, func(port: int): return http_server.start(port))
	if http_server_port <= 0:
		printerr('[HTTP] Could not find an open port in ',max_retries,' tries.')
		return
	_update_http_address()

func _update_http_address() -> void:
	http_server_address = str('http://',ip_address,':',http_server_port)
	print('[HTTP] Server address: ',http_server_address)
	http_address_changed.emit(http_server_address)

func start_ws_server(port: int, max_retries: int) -> void:
	ws_server.stop()
	
	print('[WebSocket] Finding an open port starting at: ',port)
	ws_server_port = Util.find_open_port(port, max_retries, func(port: int): return ws_server.start(port))
	if ws_server_port <= 0:
		printerr('[WebSocket] Could not find an open port in ',max_retries,' tries.')
		return
	_update_ws_address()

func _update_ws_address() -> void:
	ws_server_address = str('http://',ip_address,':',ws_server_port)
	print('[WebSocket] Server address: ',ws_server_address)

func _process(delta: float) -> void:
	if input_handle_mode == InputHandleMode.Idle:
		handle_all_inputs()

func _physics_process(delta: float) -> void:
	if input_handle_mode == InputHandleMode.Physics:
		handle_all_inputs()

func handle_all_inputs() -> void:
	for controller in _controllers.values():
		for input in controller._inputs:
			if typeof(input) != TYPE_OBJECT: continue
			if input.has_method('handle'):
				input.call('handle')

## Returns null if client is not found
func get_client(peer_id: int) -> Client:
	if not _clients.has(peer_id): return null
	return _clients[peer_id]

func kick_client(peer_id: int, reason: String) -> void:
	ws_server.close_socket(peer_id, 1000, reason)
	_clients.erase(peer_id)

## Returns null if not found
func get_controller(session_id: int) -> Controller:
	if not _controllers.has(session_id): return null
	return _controllers[session_id]

## Returns null if not found
func get_controller_by_peer(peer_id: int) -> Controller:
	var client: Client = _clients[peer_id]
	if not client.is_assigned: return null
	return get_controller(peer_id)

func get_input(session_id: int, id: Variant) -> Variant:
	var controller := get_controller(session_id)
	return controller.get_input(id)

func get_input_by_peer(peer_id: int, id: Variant) -> Variant:
	var controller := get_controller_by_peer(peer_id)
	return controller.get_input(id)

func add_controller(session_id: int) -> Controller:
	assert(not _controllers.has(session_id), str('Cannot add controller. A controller with session id #', session_id,' already exists.'))

	var controller := Controller.new(session_id)
	_controllers[session_id] = controller
	controller_added.emit(session_id)

	# TODO: LAYOUT SYSTEM
	controller.clear_inputs()
	controller.register_input(&'a', BtnInput.new())
	controller.register_input(&'b', BtnInput.new())
	controller.register_input(&'x', BtnInput.new())
	controller.register_input(&'y', BtnInput.new())
	controller.register_input(&'l', JoyInput.new())
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

func _on_receive_input_btn(peer_id: int, id: Variant, is_down: bool) -> void:
	var btn: BtnInput = get_input_by_peer(peer_id, id)
	btn.is_down = is_down
	if is_down:
		btn.is_just_pressed = true
	else:
		btn.is_just_released = true

func _on_receive_input_axis(peer_id: int, id: Variant, value: float) -> void:
	var axis: AxisInput = get_input_by_peer(peer_id, id)
	axis.value = value

func _on_receive_input_joy(peer_id: int, id: Variant, x: float, y: float) -> void:
	var joy: JoyInput = get_input_by_peer(peer_id, id)
	joy.position = Vector2(x, y)

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
