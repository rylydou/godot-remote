extends HttpRouter

var description_type = ''
var description_sdp = ''

func handle_get(request: HttpRequest, response: HttpResponse) -> void:
	response.json(200, {
		'type': description_type,
		'sdp': description_sdp,
	})
