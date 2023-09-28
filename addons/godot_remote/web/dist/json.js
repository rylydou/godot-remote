function json_protocol() {
  function round(x) {
    return Math.round(x * 100) / 100;
  }
  const protocol = {
    handle_message: (message) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const dict = JSON.parse(message);
      if (!dict) {
        console.error("[JSON API] Cannot parse packet. The packet is not valid json.");
        return;
      }
      if (!dict._) {
        console.error("[JSON API] Cannot parse packet. The packet is missing and type and is therefore corrupt.");
        return;
      }
      switch (dict._) {
        case "ping":
          (_a = protocol.on_ping) == null ? void 0 : _a.call(protocol, dict.sts);
          break;
        case "pong":
          (_b = protocol.on_pong) == null ? void 0 : _b.call(protocol, dict.sts, dict.rts);
          break;
        case "sync":
          (_c = protocol.on_sync) == null ? void 0 : _c.call(protocol, dict.id);
          break;
        case "sync_all":
          (_d = protocol.on_sync_all) == null ? void 0 : _d.call(protocol);
          break;
        case "layout":
          (_e = protocol.on_layout) == null ? void 0 : _e.call(protocol, dict.id);
          break;
        case "alert":
          (_f = protocol.on_alert) == null ? void 0 : _f.call(protocol, dict.title, dict.body);
          break;
        case "banner":
          (_g = protocol.on_banner) == null ? void 0 : _g.call(protocol, dict.text);
          break;
        case "clear_banner":
          (_h = protocol.on_clear_banner) == null ? void 0 : _h.call(protocol);
          break;
        default:
          console.error("[JSON API] Unknown packet type: ", dict._);
          break;
      }
    },
    ping(sts) {
      return JSON.stringify({
        _: "ping",
        sts
      });
    },
    pong(sts, rts) {
      return JSON.stringify({
        _: "pong",
        sts,
        rts
      });
    },
    input_btn(id, is_down) {
      return JSON.stringify({
        _: "input",
        id,
        d: is_down
      });
    },
    input_axis(id, value) {
      return JSON.stringify({
        _: "input",
        id,
        v: round(value)
      });
    },
    input_joy(id, x, y) {
      return JSON.stringify({
        _: "input",
        id,
        x: round(x),
        y: round(y)
      });
    },
    name(name) {
      return JSON.stringify({
        _: "name",
        name
      });
    },
    session(sid) {
      return JSON.stringify({
        _: "session",
        sid
      });
    },
    layout_ready(id) {
      return JSON.stringify({
        _: "layout_ready",
        id
      });
    }
  };
  return protocol;
}
export {
  json_protocol as default
};
