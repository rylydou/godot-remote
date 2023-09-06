export function length_sqr(x, y) {
    return x * x + y * y;
}
export function length(x, y) {
    return Math.sqrt(x * x + y * y);
}
export function distance_sqr(x1, y1, x2, y2) {
    var dx = (x2 - x1);
    var dy = (y2 - y1);
    return length_sqr(dx, dy);
}
export function distance(x1, y1, x2, y2) {
    var dx = (x2 - x1);
    var dy = (y2 - y1);
    return length(dx, dy);
}
export function normalize(x, y) {
    var len = length(x, y);
    return [x / len, y / len];
}
export function clamp_length(x, y, max_length) {
    var len = length(x, y);
    var factor = Math.min(len, max_length) / len;
    return [x * factor, y * factor];
}
export function angle(x, y) {
    return Math.atan2(y, x);
}
export function from_angle(angle_rad, length) {
    return [Math.cos(angle_rad) * length, Math.sin(angle_rad) * length];
}
//# sourceMappingURL=vec.js.map