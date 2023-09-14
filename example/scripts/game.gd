class_name Game extends Node

@export var world_node: Node2D
@export var player_scene: PackedScene

## Session ID (int) to Player
var active_players: Dictionary

func _ready() -> void:
	Remote.controller_added.connect(_on_controller_added)
	Remote.controller_removed.connect(_on_controller_removed)

func _on_controller_added(session_id: int) -> void:
	var player: Player = player_scene.instantiate()
	player.controller = Remote.get_controller(session_id)
	world_node.add_child(player)
	active_players[session_id] = player

func _on_controller_removed(session_id: int) -> void:
	var player: ControllerViewer = active_players[session_id]
	world_node.remove_child(player)
