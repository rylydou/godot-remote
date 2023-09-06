import { distance_sqr } from '../vec.js';
export function create_button(client, id, options) {
    var label = options.label || '';
    var center_x = options.center_x || 0;
    var center_y = options.center_y || 0;
    var radius = options.radius || 3;
    var outline_thickness = .5;
    var pointer_id = 0;
    var is_active = false;
    var synced_active = false;
    var button = {
        client: client,
        force_sync: function () {
            if (!client.is_connected)
                return;
            if (synced_active == is_active)
                return;
            button.force_sync();
        },
        auto_sync: function () {
            synced_active = is_active;
            client.api.send_input_btn(id, synced_active);
        },
        down: function (x, y, pid) {
            if (is_active)
                return;
            if (distance_sqr(center_x, center_y, x, y) <= radius * radius) {
                is_active = true;
                pointer_id = pid;
                button.force_sync();
            }
        },
        up: function (x, y, pid) {
            if (!is_active)
                return;
            if (pid != pointer_id)
                return;
            is_active = false;
            button.force_sync();
        },
        render: function (ctx) {
            ctx.translate(center_x, center_y);
            ctx.beginPath();
            ctx.ellipse(0, 0, radius, radius, 0, 0, 7);
            if (is_active) {
                ctx.fill();
            }
            ctx.lineWidth = outline_thickness;
            ctx.stroke();
            if (is_active) {
                ctx.globalCompositeOperation = 'destination-out';
            }
            ctx.font = "bold ".concat(radius, "px Bespoke Sans");
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
        }
    };
    return button;
}
//# sourceMappingURL=button.js.map