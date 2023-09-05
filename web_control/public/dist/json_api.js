export function json_api(send_packet) {
    function send_json(data) {
        var json = JSON.stringify(data);
        send_packet(json);
    }
    function round(x) {
        return Math.round(x * 100) / 100;
    }
    var api = {
        send_packet: send_packet,
        handle_packet: function (data) {
            var dict = JSON.parse(data);
            switch (dict._) {
                case 'ping':
                    api.receive_ping(dict.sts);
                    break;
                case 'pong':
                    api.receive_pong(dict.sts, dict.rts);
                    break;
                case 'sync':
                    api.receive_sync(dict.id);
                    break;
                case 'layout':
                    api.receive_layout(dict.id);
                    break;
                case 'alert':
                    api.receive_alert(dict.title, dict.body);
                    break;
                case 'banner':
                    api.receive_banner(dict.text);
                    break;
                case 'clear_banner':
                    api.receive_clear_banner();
                    break;
            }
        },
        receive_ping: function (sts) { },
        receive_pong: function (sts, rts) { },
        receive_sync: function (id) { },
        receive_sync_all: function () { },
        receive_layout: function (id) { },
        receive_alert: function (title, body) { },
        receive_banner: function (text) { },
        receive_clear_banner: function () { },
        send_ping: function (sts) {
            send_json({
                _: 'ping',
                sts: sts
            });
        },
        send_pong: function (sts, rts) {
            send_json({
                _: 'pong',
                sts: sts,
                rts: rts
            });
        },
        send_input_btn: function (id, is_down) {
            send_json({
                _: 'input',
                id: id,
                d: is_down
            });
        },
        send_input_axis: function (id, value) {
            send_json({
                _: 'input',
                id: id,
                v: round(value)
            });
        },
        send_input_joy: function (id, x, y) {
            send_json({
                _: 'input',
                id: id,
                x: round(x),
                y: round(y)
            });
        },
        send_name: function (name) {
            send_json({
                _: 'name',
                name: name
            });
        },
        send_session: function (sid) {
            send_json({
                _: 'session',
                sid: sid
            });
        },
        send_layout_ready: function (id) {
            send_json({
                _: 'layout_ready',
                id: id
            });
        }
    };
    return api;
}
//# sourceMappingURL=json_api.js.map