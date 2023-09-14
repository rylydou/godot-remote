# https://github.com/godotengine/godot-demo-projects/blob/e9f0f75c5ba0fe81197b35f31c73e09a70be5054/networking/webrtc_minimal/Signaling.gd
extends Node

# We will store the two peers here
var peers = []

func register(path: String):
	assert(peers.size() < 2)
	peers.append(path)
	if peers.size() == 2:
		get_node(peers[0]).peer.create_offer()

func _find_other(path: String):
	# Find the other registered peer.
	for p in peers:
		if p != path:
			return p
	return ''

func send_session(path: String, type, sdp):
	var other = _find_other(path)
	assert(other != '')
	get_node(other).peer.set_remote_description(type, sdp)


func send_candidate(path: String, media: String, index: int, cname: String):
	var other = _find_other(path)
	assert(other != '')
	get_node(other).peer.add_ice_candidate(media, index, name)
