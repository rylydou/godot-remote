shader_type canvas_item;

uniform float radius: hint_range(0.0, 1.0) = 1.0;
uniform float progress: hint_range(0.0, 1.0) = .67;
uniform float size_px = 128;

uniform vec4 fill_color: source_color = vec4(0., 1., 0., 1.);
uniform vec4 bg_color: source_color = vec4(0., 0., 0., .5);
uniform float bg_blur_amount: hint_range(0.0, 1.0) = 4.;
uniform vec4 frame_color: source_color = vec4(0., 0., 0., 1.);
uniform float frame_thickness: hint_range(0.0, 1.0) = .1;

uniform sampler2D SCREEN_TEXTURE: hint_screen_texture, filter_linear_mipmap;

void fragment() {
	const vec2 center = vec2(.5, .5);
	vec2 uv = UV - center;
	float feather = 1./size_px;
	float h_feather = feather*.5;
	
	float len = length(uv);
	float angle = atan(uv.x, uv.y)/TAU+.5;
	
	float h_radius = (radius)*.5;
	float circle = 1. - smoothstep(h_radius - h_feather, h_radius + h_feather, len);
	
	float progress_alpha = 1. - smoothstep(progress, progress + feather*(len*.5), angle);
	
	float fill_alpha = circle*progress_alpha;
	
	float q_frame_thickness = frame_thickness*.25;
	float frame = smoothstep(h_feather, 0., abs(len - h_radius + q_frame_thickness - h_feather) - q_frame_thickness);
	
	vec3 screen_blurred = textureLod(SCREEN_TEXTURE, SCREEN_UV, bg_blur_amount).rgb;
	vec4 color = mix(mix(bg_color, fill_color, fill_alpha), frame_color, frame);
	COLOR.rgb *= mix(screen_blurred, color.rgb, color.a);
	COLOR.a *= circle;
}
