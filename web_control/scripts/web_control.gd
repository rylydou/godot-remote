class_name WebControl extends Node

@export_group('HTTP Server', 'http_')
@export var http_server: HttpServer
@export var http_server_port := 8080
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
	prints('Available IP Addresses:', ip_addresses)
	
	ip_address = str(ip_addresses[0])
	prints('Using IP Address:', ip_address)
	
	http_server_address = 'http://' + ip_address + ':' + str(http_server_port)
	prints('HTTP Server Address:', http_server_address)
	
	ws_server_address = 'ws://' + ip_address + ':' + str(ws_server_port)
	prints('Websocket Server Address:', ws_server_address)
	
	print('Creating QR Code')
	var qr_code = QrCode.new()
	qr_code.error_correct_level = QrCode.ERROR_CORRECT_LEVEL.LOW
	var qr_code_texture = qr_code.get_texture(http_server_address)
	qr_code_texture_rect.texture = qr_code_texture
	
	start_server()
	
	#ws_server.client_connected.connect(func(peer_id): print('[Websocket] Peer connected #',peer_id))
	#ws_server.client_disconnected.connect(func(peer_id): print('[Websocket] Peer disconnected #',peer_id))
	#ws_server.message_received.connect(func(peer_id, message): print('[Websocket] #',peer_id,': ',message))

func start_server() -> void:
	print('Stopping HTTP Server')
	#http_server.stop()
	print('Stopping Websocket Server')
	#ws_server.stop()
	
	print('Setting up HTTP Server')
	http_file_router = HttpFileRouter.new(http_public_folder)
	http_server.register_router('/*', http_file_router)
	
	print('Starting HTTP Server')
	http_server.start()
	
	print('Setting up Websocket Server')
	
	print('Starting Websocket Server')
	ws_server.start(ws_server_port)
