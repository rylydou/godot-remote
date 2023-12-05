extends RefCounted


var is_down := false
var is_just_pressed := false
var is_just_released := false


func handle() -> void:
	is_just_pressed = false
	is_just_released = false
