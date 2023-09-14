extends MarginContainer

@export var qr_code_rect: QRCodeRect

func _ready() -> void:
	Remote.http_address_changed.connect(
		func(address: String):
			qr_code_rect.data = address
	)
