export function create_client(ws_address) {
    var client = {
        ws_address: ws_address,
        ws: new WebSocket(ws_address),
        is_connected: false,
        status: 'Connecting...',
        on_status_change: function () { },
        send_name: function (name) {
            console.error('Undefined');
        },
        send_button: function (id, is_down) {
            console.error('Undefined');
        },
        send_axis: function (id, value) {
            console.error('Undefined');
        },
        send_joy: function (id, x, y) {
            console.error('Undefined');
        }
    };
    client.ws.onopen = function (event) {
        client.status = 'Connected';
        if (client.on_status_change)
            client.on_status_change();
    };
    client.ws.onclose = function (event) {
        client.status = 'Disconnected';
        if (client.on_status_change)
            client.on_status_change();
    };
    client.ws.onerror = function (event) {
        console.error('[Websocket] Error: ', event);
        client.status = 'Error: ' + event.toString();
        if (client.on_status_change)
            client.on_status_change();
    };
    return client;
}
export function create_json_client(ws_address) {
    var _this = this;
    var client = create_client(ws_address);
    function send(data) {
        client.ws.send(JSON.stringify(data));
    }
    client.send_name = function (name) {
        _this.send({
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