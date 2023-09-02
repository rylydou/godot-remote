class_name Controller extends Node

## The session id. Used to remember clients after disconnects.
var sid: int

## The Websocket id of the current connection.
var peer_id: int
## peer_id != 0
var is_connected: bool

## The username of the controller.
var username: String

## The last time a ping was sent
var last_heartbeat_timestamp: int
## The toltal numbers of pings. Used to calculate an average.
var ping_count: int
## A sum of all ping durations. Used to calculate an average.
var ping_sum: int
## The last ping time in milliseconds
var last_ping_ms: int
## The average ping time in milliseconds
var avg_ping_ms: int
