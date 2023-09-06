import { angle, clamp_length, distance_sqr, from_angle, length } from '../vec.js';
export function create_joystick(client, id, options) {
    var radius = options.radius || 4;
    var padding = options.padding || 1;
    var bounds_thickness = .5;
    var line = 1;
    var handle_radius = 3;
    var handle_outline = .5;
    var label = options.label || '';
    var number_of_angles = 8;
    var steps_of_precision = 2;
    var active = false;
    var pointer_id = 0;
    var center_x = options.center_x || 0;
    var center_y = options.center_y || 0;
    var stick_x = 0;
    var stick_y = 0;
    var synced_x = 0;
    var synced_y = 0;
    var joystick = {
        client: client,
        force_sync: function () {
            synced_x = stick_x || 0;
            synced_y = stick_y || 0;
            client.api.send_input_joy(id, synced_x, synced_y);
        },
        auto_sync: function () {
            if (!client.is_connected)
                return;
            var ang = angle(stick_x, stick_y);
            var len = length(stick_x, stick_y);
            var angles_of_precision = number_of_angles / (2 * Math.PI);
            ang = Math.round(ang * angles_of_precision) / angles_of_precision;
            len = Math.round(len * steps_of_precision) / steps_of_precision;
            var _a = from_angle(ang, len), x = _a[0], y = _a[1];
            if (x == synced_x && y == synced_y)
                return;
            joystick.force_sync();
        },
        down: function (x, y, pid) {
            if (active)
                return;
            if (distance_sqr(center_x, center_y, x, y) <= (radius + padding) * (radius + padding)) {
                active = true;
                pointer_id = pid;
            }
            joystick.force_sync();
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
        },
        up: function (x, y, pid) {
            if (!active)
                return;
            if (pid != pointer_id)
                return;
            active = false;
            stick_x = 0;
            stick_y = 0;
            joystick.force_sync();
        },
        render: function (ctx) {
            ctx.translate(center_x, center_y);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.ellipse(0, 0, radius + padding, radius + padding, 0, 0, 7);
            ctx.lineWidth = bounds_thickness;
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(stick_x * radius, stick_y * radius, handle_radius + handle_outline, handle_radius + handle_outline, 0, 0, 7);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(stick_x * radius, stick_y * radius);
            ctx.lineWidth = line;
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(stick_x * radius, stick_y * radius, handle_radius, handle_radius, 0, 0, 7);
            ctx.fill();
            ctx.beginPath();
            ctx.fillStyle = 'red';
            ctx.ellipse(synced_x * radius, synced_y * radius, handle_radius * .5, handle_radius * .5, 0, 0, 7);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.font = "bold ".concat(handle_radius, "px Bespoke Sans");
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillText(label, stick_x * radius, stick_y * radius);
            ctx.globalCompositeOperation = 'source-over';
        }
    };
    return joystick;
}
//# sourceMappingURL=joystick.js.map