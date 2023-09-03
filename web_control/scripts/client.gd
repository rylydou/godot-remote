class_name Client extends RefCounted

## The WebSocket peer id.
var peer_id := 0

var session_id := 0
var is_assigned := false

## The last time a pong was received.
var last_pong_timestamp := 0
var is_awaiting_ping := false
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
