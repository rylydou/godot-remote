import { clamp_length, distance_sqr } from '../vec.js';
export function create_joystick(client, id, options) {
    var radius = options.radius || 4;
    var padding = options.padding || 1;
    var bounds_thickness = .5;
    var line = 1;
    var handle_radius = 3;
    var handle_outline = .5;
    var label = options.label || '';
    var active = false;
    var pointer_id = 0;
    var center_x = options.center_x || 0;
    var center_y = options.center_y || 0;
    var stick_x = 0;
    var stick_y = 0;
    function sync() {
        client.send_joy(id, stick_x, stick_y);
    }
    return {
        client: client,
        sync: sync,
        down: function (x, y, pid) {
            if (active)
                return;
            if (distance_sqr(center_x, center_y, x, y) <= (radius + padding) * (radius + padding)) {
                active = true;
                pointer_id = pid;
            }
        },
        move: function (x, y, pid) {
            if (!active)
                return;
            if (pid != pointer_id)
                return;
            stick_x = (x - center_x) / radius;
            stick_y = (y - center_y) / radius;
            var vec = clamp_length(stick_x, stick_y, 1);
            stick_x = vec[0];
            stick_y = vec[1];
            sync();
        },
        up: function (x, y, pid) {
            if (!active)
                return;
            if (pid != pointer_id)
                return;
            active = false;
            stick_x = 0;
            stick_y = 0;
            sync();
        },
        render: function (ctx) {
            ctx.translate(center_x, center_y);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.ellipse(0, 0, radius + padding, radius + padding, 0, 0, 7);
            ctx.lineWidth = bounds_thickness;
            ctx.strokeStyle = 'white';
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(stick_x * radius, stick_y * radius, handle_radius + handle_outline, handle_radius + handle_outline, 0, 0, 7);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(stick_x * radius, stick_y * radius);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = line;
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(stick_x * radius, stick_y * radius, handle_radius, handle_radius, 0, 0, 7);
            ctx.strokeStyle = 'black';
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.font = "bold ".concat(handle_radius, "px Bespoke Sans");
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, stick_x * radius, stick_y * radius);
        }
    };
}
//# sourceMappingURL=joystick.js.map