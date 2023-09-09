class_name WebControl extends Node

@export_group('HTTP Server', 'http_')
@export var http_server: HttpServer
@export var http_server_port := 8080
@export var http_qr_code_level := QrCode.ERROR_CORRECT_LEVEL.LOW
@export_dir var http_public_folder := 'res://web_control/public/'
var http_server_address: String
var http_file_router: HttpFileRouter

@export_group('Websocket Server', 'ws_')
@export var ws_heartbeat_time := 1000
@export var ws_server: WebSocketServer
@export var ws_server_port := 8081
var ws_server_address: String

@export_group('UI References')
@export var qr_code_texture_rect: TextureRect

var ip_address: String

func _ready() -> void:
	var ip_addresses = IP.get_local_addresses()
	print('Available IP addresses: ',ip_addresses)
	
	ip_address = str(ip_addresses[0])
	print('Using IP address: ',ip_address)
	
	http_server_address = 'http://' + ip_address + ':' + str(http_server_port)
	print('HTTP server address: ',http_server_address)
	
	ws_server_address = 'ws://' + ip_address + ':' + str(ws_server_port)
	print('Websocket server address: ',ws_server_address)
	
	print('Creating QR code at level ',http_qr_code_level)
	var qr_code = QrCode.new()
	qr_code.error_correct_level = http_qr_code_level
	var qr_code_texture = qr_code.get_texture(http_server_address)
	qr_code_texture_rect.texture = qr_code_texture
	
	start_servers()

func start_servers() -> void:
	print('Setting up HTTP Server')
	http_server.port = http_server_port
	http_file_router = HttpFileRouter.new(http_public_folder)
	http_server.register_router('/*', http_file_router)
	
	print('Starting HTTP Server')
	http_server.start()
	
	print('Starting Websocket Server')
	ws_server.start(ws_server_port)

func restart_http_server() -> void:
	print('Stopping HTTP server')
	http_server.stop()
	http_server.start()

func restart_ws_server() -> void:
	print('Stopping WebSocket server')
	ws_server.stop()
	ws_server.start(ws_server_port)
