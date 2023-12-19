shader_type canvas_item;


uniform vec4 key_color : source_color = vec4(1., 0., 0., 1.);


varying flat vec4 MODULATE;


void vertex() {
	MODULATE = COLOR;
}


void fragment() {
	vec4 tex = texture(TEXTURE, UV);
	
	if (tex == key_color) {
		COLOR = MODULATE;
	}
	else {
		COLOR = tex;
	}
}
