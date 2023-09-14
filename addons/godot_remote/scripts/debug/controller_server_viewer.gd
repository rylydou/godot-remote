extends Node

@export var controller_view_scene: PackedScene

## Session ID (int) to ControllerViewer
var active_viewers: Dictionary

func _ready() -> void:
	Remote.controller_added.connect(_on_controller_added)
	Remote.controller_removed.connect(_on_controller_removed)

func _on_controller_added(session_id: int) -> void:
	var controller_view: ControllerViewer = controller_view_scene.instantiate()
	controller_view.session_id = session_id
	controller_view.remote = Remote
	add_child(controller_view)
	active_viewers[session_id] = controller_view

func _on_controller_removed(session_id: int) -> void:
	var controller_view: ControllerViewer = active_viewers[session_id]
	remove_child(controller_view)
