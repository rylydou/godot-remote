extends MarginContainer


@export var qr_code_rect: QRCodeRect


func _ready() -> void:
	Remote.http_address_changed.connect(qr_code_rect.set_data)


func remove_idle() -> void:
	Remote.remove_idle_controllers()
