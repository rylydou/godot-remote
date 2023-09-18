extends HttpRouter

const WebRtcDriver = preload('res://addons/godot_remote/scripts/drivers/webrtc_driver.gd')

var driver: WebRtcDriver

func _init(driver: WebRtcDriver) -> void:
	self.driver = driver 

func handle_post(request: HttpRequest, response: HttpResponse) -> void:
	if not request.body: response.send(400, 'Bad Request. Missing body.'); return
	
	var dict: Dictionary = request.get_body_parsed()
	if not dict.has('peer_id'): response.send(400, 'Bad Request. Missing peer_id.'); return
	if not dict.has('candidate'): response.send(400, 'Bad Request. Missing candidate.'); return
	
	var peer_id := int(dict.peer_id)
	var candidate := str(dict.candidate)
	
	driver.handle_ice(response, peer_id, candidate)
