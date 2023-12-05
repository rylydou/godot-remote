extends RefCounted


# This is the configuration file for Godot Remote.
# In case if something goes wrong you can find the original file here:
# - https://github.com/rylydou/godot-remote/blob/main/addons/godot_remote/plugin.gd.

# The name of the autoload singleton. Default: 'Remote'.
const autoload_name := 'Remote'

# The driver the controller server uses.
# Uncomment the desired driver use and comment out the others.
# 1. WebSocket Driver (Default)
const Driver := preload('res://addons/godot_remote/scripts/drivers/websocket_driver.gd')
# 2. WebRTC Driver
#const driver := preload('res://addons/godot_remote/scripts/drivers/webrtc_driver.gd')

# The api the server and client use for communication. For now only one exists.
# Uncomment the desired api use and comment out the others.
# 1. JSON API
const API := preload('res://addons/godot_remote/scripts/apis/json_api.gd')
