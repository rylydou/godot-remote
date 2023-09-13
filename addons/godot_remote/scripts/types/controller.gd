extends RefCounted

const BtnInput = preload('res://addons/godot_remote/scripts/types/btn_input.gd')
const AxisInput = preload('res://addons/godot_remote/scripts/types/axis_input.gd')
const JoyInput = preload('res://addons/godot_remote/scripts/types/joy_input.gd')

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

## For converting binary index to input names.
var _registered_inputs: Array[StringName] = []
## Input id (StringName) to input (Variant).
var _inputs := {}

## Returns an empty StringName (falsy) if not found.
func get_input_id_from_index(index: int) -> StringName:
	if index < 0: return &''
	if index >= _registered_inputs.size(): return &''
	return _registered_inputs[index]

func clear_inputs() -> void:
	_registered_inputs.clear()
	_inputs.clear()

## Returns true if successful.
func register_input(id: StringName, value: Variant) -> bool:
	if _registered_inputs.has(id):
		printerr('Can not register input. Input ',id,' already exists.')
		return false
	_registered_inputs.append(id)
	_inputs[id] = value
	return true

## Returns null if not found.
func get_input(id: Variant) -> Variant:
	# If the id is a binary index then find the name of it
	if typeof(id) == TYPE_INT:
		id = get_input_id_from_index(id)
	if typeof(id) != TYPE_STRING:
		printerr('The id is invalid.')
		return null
	
	if not _registered_inputs.has(id):
		printerr('Input ',id,' does not exist.')
		return null
	return _inputs[id]

func is_btn_down(id: Variant) -> bool:
	var btn: BtnInput = get_input(id)
	if btn == null: return false
	return btn.is_down

func get_axis(id: Variant) -> float:
	var axis: AxisInput = get_input(id)
	if axis == null: return 0.
	return axis.value

func get_joy(id: Variant) -> Vector2:
	var joy: JoyInput = get_input(id)
	if joy == null: return Vector2.ZERO
	return joy.position
