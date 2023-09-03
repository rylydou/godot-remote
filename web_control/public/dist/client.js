import { SESSION_STORAGE_KEY } from './consts.js';
export function create_client() {
    var client = {
        ws: null,
        ws_address: '',
        auto_reconnect: true,
        session_id: 0,
        connect: function (ws_address) { },
        is_connected: false,
        status: 'Connecting...',
        on_status_change: function () { },
        is_awaiting_ping: false,
        last_pong_timestamp: 0,
        last_ping: 0,
        ping_sum: 0,
        ping_count: 0,
        get_avg_ping: function () { return client.ping_sum / client.ping_count; },
        receive_ping: function (sts) {
            client.send_pong(sts);
        },
        receive_pong: function (sts, rts) {
            var timestamp = Date.now();
            var ping = timestamp - sts;
            client.last_ping = ping;
            client.ping_sum += ping;
            client.ping_count++;
        },
        send_ping: function () { console.error('Undefined'); },
        send_pong: function (sts) { console.error('Undefined'); },
        send_session: function (sid) { console.error('Undefined'); },
        send_name: function (name) { console.error('Undefined'); },
        send_button: function (id, is_down) { console.error('Undefined'); },
        send_axis: function (id, value) { console.error('Undefined'); },
        send_joy: function (id, x, y) { console.error('Undefined'); }
    };
    var new_session_id = Math.floor(Math.random() * 100000);
    client.session_id = Number(sessionStorage.getItem(SESSION_STORAGE_KEY) || new_session_id);
    sessionStorage.setItem(SESSION_STORAGE_KEY, client.session_id.toString());
    client.connect = function (ws_address) {
        if (client.ws && client.ws.readyState != 3) {
            client.ws.close(1000, 'Reconnect');
        }
        client.ws_address = ws_address;
        client.ws = new WebSocket(ws_address);
        listen();
    };
    function listen() {
        client.ws.onmessage = function (event) {
            console.log('[Websocket] Message: ', event.data);
        };
        client.ws.onopen = function (event) {
            console.log('[Websocket] Opened');
            client.status = 'Connected';
            client.is_connected = true;
            if (client.on_status_change)
                client.on_status_change();
            client.send_session(client.session_id);
        };
        client.ws.onclose = function (event) {
            console.log('[Websocket] Closed: ', { code: event.code, reason: event.reason, was_clean: event.wasClean });
            client.status = 'Disconnected';
            client.is_connected = false;
            if (client.on_status_change)
                client.on_status_change();
        };
        client.ws.onerror = function (event) {
            console.error('[Websocket] Error: ', event);
            client.status = 'Error: ' + event.toString();
            client.is_connected = false;
            if (client.on_status_change)
                client.on_status_change();
            if (client.auto_reconnect) {
                client.connect(client.ws_address);
            }
        };
    }
    return client;
}
export function create_json_client() {
    var client = create_client();
    function send(data) {
        client.ws.send(JSON.stringify(data));
    }
    client.send_ping = function () {
        send({
            _: 'ping',
            sts: Date.now()
        });
    };
    client.send_pong = function (sts) {
        send({
            _: 'pong',
            sts: sts,
            rts: Date.now()
        });
    };
    client.send_session = function (sid) {
        send({
            _: 'session',
            sid: sid
        });
    };
    client.send_name = function (name) {
        send({
            _: 'name',
            name: name
        });
    };
    client.send_button = function (id, is_down) {
        send({
            _: 'input',
            id: id,
            d: is_down
        });
    };
    client.send_axis = function (id, value) {
        send({
            _: 'input',
            id: id,
            v: Math.round(value * 100) / 100
        });
    };
    client.send_joy = function (id, x, y) {
        send({
            _: 'input',
            id: id,
            x: Math.round(x * 100) / 100,
            y: Math.round(y * 100) / 100
        });
    };
    return client;
}
//# sourceMappingURL=client.js.map