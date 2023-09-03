class_name Controller extends RefCounted

## The session id. Used to remember clients after disconnects.
var session_id: int

## The Websocket id of the current connection.
var peer_id: int
## Same as peer_id != 0.
var is_connected: bool

## The username of the controller.
var username: String

func _init(session_id: int) -> void:
	self.session_id = session_id
