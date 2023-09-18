extends HttpRouter

const WebRtcDriver = preload('res://addons/godot_remote/scripts/drivers/webrtc_driver.gd')

var driver: WebRtcDriver

func _init(driver: WebRtcDriver) -> void:
	self.driver = driver 

func handle_post(request: HttpRequest, response: HttpResponse) -> void:
	if not request.body: response.send(400, 'Bad Request. Missing body.'); return
	
	var dict: Dictionary = request.get_body_parsed()
	if not dict.has('type'): response.send(400, 'Bad Request. Missing type.'); return
	if not dict.has('sdp'): response.send(400, 'Bad Request. Missing sdp.'); return
	
	var offer_type := str(dict.type)
	var offer_sdp := str(dict.sdp)
	
	driver.handle_offer(response, offer_type, offer_sdp)
