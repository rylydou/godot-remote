@tool
extends EditorPlugin

const AUTOLOAD_NAME = 'Remote'
const AUTOLOAD_PATH = 'res://addons/godot_remote/scenes/autoloads/remote.tscn'

func _enter_tree():
	var check: bool = Engine.get_version_info().major == 4 && Engine.get_version_info().minor == 1
	
	if not check:
		printerr('[GodotRemote] This plugin is made for Godot 4.1.X. The plugin might not work properly.\nTry looking for any updates at: https://github.com/rylydou/godot-remote/releases.')
	
	add_autoload_singleton(AUTOLOAD_NAME, AUTOLOAD_PATH)

func _exit_tree():
	remove_autoload_singleton(AUTOLOAD_NAME)
