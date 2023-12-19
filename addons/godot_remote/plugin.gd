@tool
extends EditorPlugin


const AUTOLOAD_NAME := 'Remote'


const AUTOLOAD_PATH := 'res://addons/godot_remote/scenes/autoloads/remote.tscn'
const GITHUB_RELEASES_LINK := 'https://github.com/rylydou/godot-remote/releases'
const COMPAT_MAJOR := 4
const COMPAT_MINOR := 2


func _enter_tree():
	var major: int = Engine.get_version_info().major
	var minor: int = Engine.get_version_info().minor
	var check_strict := major == COMPAT_MAJOR && minor == COMPAT_MINOR
	var check_loose := major == COMPAT_MAJOR && minor >= COMPAT_MINOR
	
	if not check_strict:
		var txt = str('[GodotRemote] This plugin is made for Godot ',major,'.',minor,' but you are running ',Engine.get_version_info().string,'. The plugin might not work properly.\n')
		if major > COMPAT_MAJOR or minor > COMPAT_MINOR:
			txt += 'Get updates for the plugin at: \n'
		else:
			txt += str('Try looking for a version compatible with this Godot version (',Engine.get_version_info().string,') at: \n')
		txt += str(GITHUB_RELEASES_LINK,'.')
		
		if check_loose:
			push_warning(txt)
		else:
			printerr(txt)
	
	add_autoload_singleton(AUTOLOAD_NAME, AUTOLOAD_PATH)


func _exit_tree():
	remove_autoload_singleton(AUTOLOAD_NAME)
