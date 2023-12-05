extends HttpRouter


var data := {}


func handle_get(request: HttpRequest, response: HttpResponse) -> void:
	response.json(200, data)
