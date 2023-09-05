import { fill_canvas } from './canvas.js';
import { create_client } from './client.js';
import { UNIT_SIZE } from './consts.js';
import { create_button } from './controls/button.js';
import { create_joystick } from './controls/joystick.js';
import { json_api } from './json_api.js';
var api = json_api;
var client = create_client(api);
client.on_status_change = render;
client.connect("ws://".concat(window.location.hostname, ":8081"));
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var width = 0;
var height = 0;
setInterval(function () {
    if (client.ongoing_pings > 0)
        return;
    if (!client.is_connected)
        return;
    client.ping_server();
}, 3000);
fill_canvas(canvas, function () {
    width = ctx.canvas.width / window.devicePixelRatio / UNIT_SIZE;
    height = ctx.canvas.height / window.devicePixelRatio / UNIT_SIZE;
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
    ctx.scale(window.devicePixelRatio * UNIT_SIZE, window.devicePixelRatio * UNIT_SIZE);
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
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
    var text = client.status;
    if (client.is_connected) {
        text = "".concat(Math.round(client.last_ping), "ms (").concat(Math.round(client.get_avg_ping()), "ms)");
    }
    ctx.fillText(text, width / 2, 1, width * .9);
}
function pointer_down(x, y, id) {
    x = x / UNIT_SIZE;
    y = y / UNIT_SIZE;
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
    x = x / UNIT_SIZE;
    y = y / UNIT_SIZE;
    for (var _i = 0, controls_4 = controls; _i < controls_4.length; _i++) {
        var control = controls_4[_i];
        if (control.move)
            control.move(x, y, id);
    }
    render();
}
function pointer_up(x, y, id) {
    x = x / UNIT_SIZE;
    y = y / UNIT_SIZE;
    for (var _i = 0, controls_5 = controls; _i < controls_5.length; _i++) {
        var control = controls_5[_i];
        if (control.up)
            control.up(x, y, id);
    }
    render();
}
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