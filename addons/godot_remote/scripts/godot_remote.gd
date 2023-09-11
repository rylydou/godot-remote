class_name GodotRemote extends Node

const QrCode = preload('res://addons/qr_code/qr_code.gd')
const QrCodeRect = preload('res://addons/qr_code/qr_code_rect.gd')

@export var starting_port = 8080
@export var max_port_retries = 10

@export_group('HTTP Server', 'http_')
@export var http_server: HttpServer
@export_dir var http_public_folder := 'res://web_control/public/'
var http_server_port: int
var http_server_address: String
var http_file_router: HttpFileRouter

@export_group('Websocket Server', 'ws_')
@export var ws_heartbeat_time := 1000
@export var ws_server: WebSocketServer
var ws_server_port: int
var ws_server_address: String

@export_group('UI References')
@export var qr_code: QrCodeRect

var ip_address: String

func _ready() -> void:
	var ip_addresses = IP.get_local_addresses()
	print('Available IP addresses: ',ip_addresses)
	
	ip_address = str(ip_addresses[0])
	print('Using IP address: ',ip_address)
	
	ws_server_address = 'ws://' + ip_address + ':' + str(ws_server_port)
	print('Websocket server address: ',ws_server_address)
	
	http_server.server_identifier = 'Godot Remote Server'
	http_file_router = HttpFileRouter.new(http_public_folder)
	http_server.register_router('/*', http_file_router)
	
	start_servers()

func start_servers() -> void:
	print('[Godot Remote] Starting')
	
	var current_port = starting_port
	
	print('Starting HTTP Server')
	start_http_server(current_port, max_port_retries)
	
	print('Starting Websocket Server')
	start_ws_server(current_port, max_port_retries)

func start_http_server(port: int, max_retries: int) -> void:
	http_server.stop()
	
	print('[HTTP] Finding an open port starting at: ',port)
	http_server_port = try_find_port(port, max_retries, func(port: int): http_server.start(port))
	update_http_address()

func update_http_address() -> void:
	http_server_address = str('http://',ip_address,':',http_server_port)
	print('[HTTP] Server address: ',http_server_address)
	qr_code.data = http_server_address

func start_ws_server(port: int, max_retries: int) -> void:
	ws_server.stop()
	
	ws_server_port = try_find_port(port, max_retries, func(port: int): ws_server.start(port))
	update_ws_address()

func update_ws_address() -> void:
	ws_server_address = str('http://',ip_address,':',ws_server_port)
	print('[WebSocket] Server address: ',ws_server_address)

func try_find_port(port: int, max_retries: int, start_server: Callable) -> int:
	for i in range(max_retries):
		var err: int = start_server.call(port)
		match err:
			OK: return port
			ERR_ALREADY_IN_USE:
				port += 1
				continue
			_: return -1
	return -1
