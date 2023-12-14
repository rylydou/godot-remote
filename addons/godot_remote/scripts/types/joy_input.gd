extends RefCounted


var position := Vector2.ZERO
var max_distance := 0.0
var is_just_released := false
var t := 0


func handle() -> void:
	is_just_released = true
