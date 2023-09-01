import { fill_canvas } from './canvas.js';
import { create_json_client } from './client.js';
import { create_button } from './controls/button.js';
import { create_joystick } from './controls/joystick.js';
console.log('Connecting WebSocket');
var client = create_json_client("ws://".concat(window.location.hostname, ":8081"));
client.on_status_change = render;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
fill_canvas(canvas, function () {
    var width = ctx.canvas.width / window.devicePixelRatio;
    var height = ctx.canvas.height / window.devicePixelRatio;
    controls = [
        create_joystick(client, 'l', { label: 'L', radius: 80, padding: 48, center_x: width / 4, center_y: height / 2 }),
        create_joystick(client, 'r', { label: 'R', radius: 64, padding: 16, center_x: width / 4 * 3 - 40, center_y: height / 2 - 40 }),
        create_button(client, 'a', { label: 'A', center_x: width / 4 * 3 + 100, center_y: height / 2 }),
        create_button(client, 'b', { label: 'B', center_x: width / 4 * 3, center_y: height / 2 + 100 }),
    ];
    render();
});
var controls = [];
function render() {
    var width = ctx.canvas.width / window.devicePixelRatio;
    var height = ctx.canvas.height / window.devicePixelRatio;
    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    for (var _i = 0, controls_1 = controls; _i < controls_1.length; _i++) {
        var control = controls_1[_i];
        if (control.render) {
            ctx.save();
            control.render(ctx);
            ctx.restore();
        }
    }
    ctx.font = 'normal 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'white';
    ctx.fillText(client.status, width / 2, 8, width * .9);
}
function pointer_down(x, y, id) {
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
    for (var _i = 0, controls_4 = controls; _i < controls_4.length; _i++) {
        var control = controls_4[_i];
        if (control.move)
            control.move(x, y, id);
    }
    render();
}
function pointer_up(x, y, id) {
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