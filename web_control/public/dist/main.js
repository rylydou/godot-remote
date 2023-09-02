import { fill_canvas } from './canvas.js';
import { create_json_client } from './client.js';
import { create_button } from './controls/button.js';
import { create_joystick } from './controls/joystick.js';
var client = create_json_client();
client.on_status_change = render;
client.connect("ws://".concat(window.location.hostname, ":8081"));
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var unit = 16;
var width = 0;
var height = 0;
fill_canvas(canvas, function () {
    width = ctx.canvas.width / window.devicePixelRatio / unit;
    height = ctx.canvas.height / window.devicePixelRatio / unit;
    controls = [
        create_button(client, 'a', { label: 'A', center_x: width - 4, center_y: height - 9 }),
        create_button(client, 'b', { label: 'B', center_x: width - 9, center_y: height - 4 }),
        create_button(client, 'x', { label: 'X', center_x: width - 9, center_y: height - 4 - 10 }),
        create_button(client, 'y', { label: 'Y', center_x: width - 4 - 10, center_y: height - 9 }),
        create_joystick(client, 'l', { label: 'L', radius: 4, padding: 1, center_x: 8, center_y: height - 8 }),
    ];
    render();
});
var controls = [];
function render() {
    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.scale(window.devicePixelRatio * unit, window.devicePixelRatio * unit);
    for (var _i = 0, controls_1 = controls; _i < controls_1.length; _i++) {
        var control = controls_1[_i];
        if (control.render) {
            ctx.save();
            control.render(ctx);
            ctx.restore();
        }
    }
    ctx.font = 'normal 1px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'white';
    ctx.fillText(client.status, width / 2, 1, width * .9);
}
function pointer_down(x, y, id) {
    x = x / unit;
    y = y / unit;
    for (var _i = 0, controls_2 = controls; _i < controls_2.length; _i++) {
        var control = controls_2[_i];
        if (control.down)
            control.down(x, y, id);
    }
    for (var _a = 0, controls_3 = controls; _a < controls_3.length; _a++) {
        var control = controls_3[_a];
        if (control.move)
            control.move(x, y, id);
    }
    render();
}
function pointer_move(x, y, id) {
    x = x / unit;
    y = y / unit;
    for (var _i = 0, controls_4 = controls; _i < controls_4.length; _i++) {
        var control = controls_4[_i];
        if (control.move)
            control.move(x, y, id);
    }
    render();
}
function pointer_up(x, y, id) {
    x = x / unit;
    y = y / unit;
    for (var _i = 0, controls_5 = controls; _i < controls_5.length; _i++) {
        var control = controls_5[_i];
        if (control.up)
            control.up(x, y, id);
    }
    render();
}
var down_pointers = [];
window.addEventListener('pointerdown', function (ev) {
    ev.preventDefault();
    pointer_down(ev.x, ev.y, ev.pointerId);
});
window.addEventListener('pointerup', function (ev) {
    ev.preventDefault();
    pointer_up(ev.x, ev.y, ev.pointerId);
});
window.addEventListener('pointermove', function (ev) {
    ev.preventDefault();
    pointer_move(ev.x, ev.y, ev.pointerId);
});
canvas.addEventListener('touchstart', function (ev) { return ev.preventDefault(); });
//# sourceMappingURL=main.js.map