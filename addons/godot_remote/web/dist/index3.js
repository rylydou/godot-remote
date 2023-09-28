function ws_client() {
  let ws = null;
  const driver = {
    name: "WebSocket",
    is_connected: false,
    async connect() {
      var _a;
      let address = "$_WS_ADDRESS_$";
      if (address.startsWith("$")) {
        address = `ws://${location.hostname}:8081`;
      }
      console.log("[WebSocket] Connecting to:", address);
      ws = new WebSocket(address);
      ws.onmessage = (event) => {
        var _a2;
        console.debug("[WebSocket] Message: ", event.data);
        (_a2 = driver.on_message) == null ? void 0 : _a2.call(driver, event.data);
      };
      ws.onopen = (event) => {
        var _a2, _b;
        console.log("[WebSocket] Opened");
        driver.is_connected = true;
        (_a2 = driver.on_open) == null ? void 0 : _a2.call(driver);
        (_b = driver.on_status_change) == null ? void 0 : _b.call(driver);
      };
      ws.onclose = (event) => {
        var _a2, _b;
        console.log("[WebSocket] Closed");
        driver.is_connected = false;
        (_a2 = driver.on_close) == null ? void 0 : _a2.call(driver);
        (_b = driver.on_status_change) == null ? void 0 : _b.call(driver);
      };
      ws.onerror = (event) => {
        var _a2;
        driver.disconnect();
        (_a2 = driver.on_error) == null ? void 0 : _a2.call(driver, event);
      };
      (_a = driver.on_status_change) == null ? void 0 : _a.call(driver);
    },
    async disconnect() {
      var _a;
      console.log("[WebSocket] Disconnecting.");
      ws == null ? void 0 : ws.close();
      (_a = driver.on_status_change) == null ? void 0 : _a.call(driver);
    },
    get_status() {
      if (!ws)
        return "Initializing...";
      switch (ws.readyState) {
        case WebSocket.CONNECTING:
          return "Connecting...";
        case WebSocket.OPEN:
          return "Connected";
        case WebSocket.CLOSED:
          return "Disconnected";
        case WebSocket.CLOSING:
          return "Disconnecting...";
      }
      return "Initialized";
    },
    send_reliable(message) {
      ws == null ? void 0 : ws.send(message);
    },
    send_unreliable(message) {
      ws == null ? void 0 : ws.send(message);
    }
  };
  return driver;
}
export {
  ws_client as default
};
