import { distance_sqr } from '../vec.js';
export function create_button(client, id, options) {
    var label = options.label || '';
    var center_x = options.center_x || 0;
    var center_y = options.center_y || 0;
    var radius = options.radius || 3;
    var outline_thickness = .5;
    var active = false;
    var pointer_id = 0;
    function sync() {
        if (!client.is_connected)
            return;
        client.send_button(id, active);
    }
    return {
        client: client,
        sync: sync,
        down: function (x, y, pid) {
            if (active)
                return;
            if (distance_sqr(center_x, center_y, x, y) <= radius * radius) {
                active = true;
                pointer_id = pid;
                sync();
            }
        },
        up: function (x, y, pid) {
            if (!active)
                return;
            if (pid != pointer_id)
                return;
            active = false;
            sync();
        },
        render: function (ctx) {
            ctx.translate(center_x, center_y);
            ctx.beginPath();
            ctx.ellipse(0, 0, radius, radius, 0, 0, 7);
            if (active) {
                ctx.fillStyle = 'white';
                ctx.fill();
            }
            ctx.strokeStyle = 'white';
            ctx.lineWidth = outline_thickness;
            ctx.stroke();
            ctx.fillStyle = 'white';
            if (active) {
                ctx.fillStyle = 'black';
            }
            ctx.font = "bold ".concat(radius, "px Bespoke Sans");
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, 0, 0);
        }
    };
}
//# sourceMappingURL=button.js.map