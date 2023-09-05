import { SESSION_STORAGE_KEY } from './consts.js';
export function create_client(create_api) {
    var client = {
        api: create_api(function (data) { return client.send_packet(data); }),
        send_packet: function (data) {
            if (!client.ws)
                return;
            client.ws.send(data);
        },
        ws: null,
        ws_address: '',
        auto_reconnect: true,
        is_connected: false,
        status: 'Connecting...',
        connect: function (ws_address) {
            if (client.ws && client.ws.readyState != 3) {
                client.ws.close(1000, 'Automatic close due to error.');
            }
            client.ws_address = ws_address;
            client.ws = new WebSocket(ws_address);
            listen();
        },
        on_status_change: function () { },
        session_id: 0,
        ongoing_pings: 0,
        last_pong_timestamp: 0,
        last_ping: 0,
        ping_sum: 0,
        ping_count: 0,
        get_avg_ping: function () { return client.ping_sum / Math.max(client.ping_count, 1); },
        ping_server: function () {
            client.ongoing_pings++;
            client.api.send_ping(Date.now());
        }
    };
    var new_session_id = Math.floor(Math.random() * 100000);
    client.session_id = Number(sessionStorage.getItem(SESSION_STORAGE_KEY) || new_session_id);
    sessionStorage.setItem(SESSION_STORAGE_KEY, client.session_id.toString());
    client.api.receive_ping = function (sts) {
        client.api.send_pong(sts, Date.now());
    };
    client.api.receive_pong = function (sts, rts) {
        var now = Date.now();
        var ping = now - sts;
        client.ongoing_pings--;
        client.last_ping = ping;
        client.last_pong_timestamp = now;
        client.ping_sum += ping;
        client.ping_count++;
    };
    function listen() {
        client.ws.onmessage = function (event) {
            console.debug('[WebSocket] Message: ', event.data);
            client.api.handle_packet(event.data);
        };
        client.ws.onopen = function (event) {
            console.log('[WebSocket] Opened');
            client.status = 'Connected';
            client.is_connected = true;
            if (client.on_status_change)
                client.on_status_change();
            client.api.send_session(client.session_id);
        };
        client.ws.onclose = function (event) {
            console.log('[WebSocket] Closed: ', { code: event.code, reason: event.reason, was_clean: event.wasClean });
            client.status = 'Disconnected';
            client.is_connected = false;
            if (client.on_status_change)
                client.on_status_change();
        };
        client.ws.onerror = function (event) {
            console.error('[WebSocket] Error: ', event);
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
//# sourceMappingURL=client.js.map