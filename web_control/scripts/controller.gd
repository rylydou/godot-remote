class_name Controller extends RefCounted

signal connection_changed(is_connected: bool)
signal client_changed(from_peer_id: int, to_peer_id: int)
signal username_changed(username: String)

## The session id. Used to remember clients after disconnects.
var session_id := 0

## The Websocket id of the current connection.
var peer_id := 0
## Same as peer_id != 0.
var is_connected := false

## The username of the controller.
var username := ''

func _init(session_id: int) -> void:
	self.session_id = session_id

## For converting binary index to input names
var _registered_inputs: Array[StringName] = []
## Input id (StringName) to input (Variant)
var _inputs := {}

## Returns an empty string if not found
func get_input_id_from_index(index: int) -> StringName:
	if index < 0: return &''
	if index >= _registered_inputs.size(): return &''
	return _registered_inputs[index]

func clear_inputs() -> void:
	_registered_inputs.clear()
	_inputs.clear()

## Returns true if successful
func register_input(id: StringName, value: Variant) -> bool:
	if _registered_inputs.has(id):
		printerr('Can not register input. Input ',id,' already exists.')
		return false
	_registered_inputs.append(id)
	_inputs[id] = value
	return true

## Returns true if successful
func set_input(id: StringName, value: Variant) -> bool:
	if not _registered_inputs.has(id):
		printerr('Can not set input. Input ',id,' has not been registered yet.')
		return false
	_inputs[id] = value
	return true

## Returns null if error
func get_input(id: StringName) -> Variant:
	if not _registered_inputs.has(id):
		printerr('Input ',id,' does not exist.')
		return null
	return _inputs[id]

func is_btn_down(id: StringName) -> bool:
	var input = get_input(id)
	if input == null: return false
	if typeof(input) != TYPE_BOOL:
		printerr('Input ',id,' is not a button.')
		return false
	
	var is_down: bool = input
	return is_down

func get_axis(id: StringName) -> float:
	var input = get_input(id)
	if input == null: return 0.
	if typeof(input) != TYPE_FLOAT:
		printerr('Input ',id,' is not an axis.')
		return 0.
	
	var value: float = input
	return value

func get_joy(id: StringName) -> Vector2:
	var input = get_input(id)
	if input == null: return Vector2.ZERO
	if typeof(input) != TYPE_VECTOR2:
		printerr('Input ',id,' is not a joystick.')
		return Vector2.ZERO
	
	var position: Vector2 = input
	return position
	
