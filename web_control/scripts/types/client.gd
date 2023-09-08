class_name Client extends RefCounted

signal assignment_changed(is_assigned: bool)

## The WebSocket peer id.
var peer_id := 0

## The session id the client is requesting.
var session_id := 0
## True if the client has been assigned to the requested controller.
var is_assigned := false

## The last time a pong was received.
var last_pong_timestamp := 0
## The number of pings currenly waiting on.
var ongoing_pings := 0
## The toltal numbers of pings. Used to calculate an average.
var ping_count := 0
## A sum of all ping durations. Used to calculate an average.
var ping_sum := 0
## The last ping time in milliseconds.
var last_ping_ms := 0
## The average ping time in milliseconds.
var avg_ping_ms := 0

func _init(peer_id: int) -> void:
	self.peer_id = peer_id
