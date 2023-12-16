class_name QRCodeRect extends TextureRect


const QRCode = preload('res://addons/qr_code/qr_code.gd')


@export var link: LinkButton

@export var mode := QRCode.Mode.BYTE
@export var error_correction := QRCode.ErrorCorrection.MEDIUM
@export var eci_value := QRCode.ECI.UTF_8

@export var light_module_color := Color.WHITE
@export var dark_module_color := Color.BLACK

@export var quiet_zone_size := 4


var _qr: QRCode


func _enter_tree() -> void:
	texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	
	_qr = QRCode.new()


func set_data(data: Variant) -> void:
	_qr.mode = mode
	_qr.error_correction = error_correction
	_qr.eci_value = eci_value
	
	
	match _qr.mode:
		QRCode.Mode.NUMERIC:
			_qr.put_numeric(data)
		QRCode.Mode.ALPHANUMERIC:
			_qr.put_alphanumeric(data)
		QRCode.Mode.BYTE:
			match eci_value:
				QRCode.ECI.UTF_8:
					_qr.put_byte(data.to_utf8_buffer())
				QRCode.ECI.UTF_16:
					_qr.put_byte(data.to_utf16_buffer())
				QRCode.ECI.US_ASCII:
					_qr.put_byte(data.to_ascii_buffer())
				_:
					_qr.put_byte(data)
		QRCode.Mode.KANJI:
			_qr.put_kanji(data)
	
	_update_qr()
	
	if link:
		link.uri = data


func _update_qr() -> void:
	texture = ImageTexture.create_from_image(_qr.generate_image(1, light_module_color, dark_module_color, quiet_zone_size))
