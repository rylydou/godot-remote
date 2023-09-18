function create_driver() {
  let ws = null;
  const driver = {
    async connect(address) {
      console.log("[WebSocket] Address", address);
      ws = new WebSocket(address);
      ws.onmessage = (event) => {
        console.debug("[WebSocket] Message: ", event.data);
        if (driver.on_message)
          driver.on_message(event.data);
      };
      ws.onopen = (event) => {
        console.log("[WebSocket] Opened");
        if (driver.on_open)
          driver.on_open();
        if (driver.on_status_change)
          driver.on_status_change();
      };
      ws.onclose = (event) => {
        console.log("[WebSocket] Closed");
        if (driver.on_close)
          driver.on_close();
        if (driver.on_status_change)
          driver.on_status_change();
      };
      ws.onerror = (event) => {
        driver.disconnect();
        if (driver.on_error)
          driver.on_error(event);
      };
      if (driver.on_status_change)
        driver.on_status_change();
    },
    async disconnect() {
      ws == null ? void 0 : ws.close();
      if (driver.on_status_change)
        driver.on_status_change();
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
  create_driver as default
};
