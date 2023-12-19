class_name Game extends Node


@export var world_node: Node2D
@export var player_scene: PackedScene


## Session ID (int) to Player
var active_players := {}


func _ready() -> void:
	Remote.controller_added.connect(_on_controller_added)
	Remote.controller_removed.connect(_on_controller_removed)


func _on_controller_added(session_id: int) -> void:
	var player: Player = player_scene.instantiate()
	active_players[session_id] = player
	player.controller = Remote.get_controller(session_id)
	
	world_node.add_child(player)
	player.global_position.y = randf_range(-64, +64)
	player.global_position.x = randf_range(-64, +64)


func _on_controller_removed(session_id: int) -> void:
	var player: Player = active_players[session_id]
	world_node.remove_child(player)
