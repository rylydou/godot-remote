class_name ControllerViewer extends CanvasItem


const Controller = preload('res://addons/godot_remote/scripts/types/controller.gd')


@export var remote: GodotRemote
@export var session_id: int

@export var a_btn: Control
@export var b_btn: Control
@export var x_btn: Control
@export var y_btn: Control

@export var left_stick: Control
@export var left_stick_container: Control


func _process(delta: float) -> void:
	var controller: Controller = remote.get_controller(session_id)
	if not controller:
		modulate.a = .25
		return
	
	modulate.a = 1. if controller.is_peer_connected else .5
	
	# TODO: LAYOUT SYSTEM
	var a = controller.is_btn_down(&'a')
	var b = controller.is_btn_down(&'b')
	var x = controller.is_btn_down(&'x')
	var y = controller.is_btn_down(&'y')
	var l = controller.get_joy(&'l')
	
	a_btn.modulate.a = 1. if a else .5
	b_btn.modulate.a = 1. if b else .5
	x_btn.modulate.a = 1. if x else .5
	y_btn.modulate.a = 1. if y else .5
	
	left_stick.position = left_stick_container.size/2
	left_stick.position += l*left_stick_container.size/2
	left_stick.position -= left_stick.size/2
