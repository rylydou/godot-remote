class_name Player extends CharacterBody2D

const Controller = preload('res://addons/godot_remote/scripts/types/controller.gd')

@export var unit_size := 16.0
@export var move_speed := 4.0
@export var dash_cooldown_frames := 120.0
@export var dash_stun_frames := 20.0
@export var knock_stun_frames := 30.0

var controller: Controller
var move_input: Vector2

func _ready() -> void:
	var rng = RandomNumberGenerator.new()
	rng.seed = controller.session_id
	modulate = Color.from_hsv(rng.randf(), 1.0, 1.0)

func _process(delta: float) -> void:
	move_input = controller.get_joy('l')

func _physics_process(delta: float) -> void:
	velocity = move_input*move_speed*unit_size
	move_and_slide()
