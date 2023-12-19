var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function bin() {
  const builder = {
    commands: [],
    size: 0,
    byte: (value) => {
      builder.size += 1;
      builder.commands.push((view) => view.put_byte(value));
      return builder;
    },
    sbyte: (value) => {
      builder.size += 1;
      builder.commands.push((view) => view.put_sbyte(value));
      return builder;
    },
    ushort: (value) => {
      builder.size += 2;
      builder.commands.push((view) => view.put_ushort(value));
      return builder;
    },
    short: (value) => {
      builder.size += 2;
      builder.commands.push((view) => view.put_short(value));
      return builder;
    },
    uint: (value) => {
      builder.size += 4;
      builder.commands.push((view) => view.put_byte(value));
      return builder;
    },
    int: (value) => {
      builder.size += 4;
      builder.commands.push((view) => view.put_sbyte(value));
      return builder;
    },
    ulong: (value) => {
      builder.size += 8;
      builder.commands.push((view) => view.put_ulong(value));
      return builder;
    },
    long: (value) => {
      builder.size += 8;
      builder.commands.push((view) => view.put_long(value));
      return builder;
    },
    float: (value) => {
      builder.size += 4;
      builder.commands.push((view) => view.put_float(value));
      return builder;
    },
    double: (value) => {
      builder.size += 8;
      builder.commands.push((view) => view.put_double(value));
      return builder;
    },
    fixed_sbyte: (value) => {
      builder.size += 1;
      builder.commands.push((view) => view.put_fixed_sbyte(value));
      return builder;
    },
    fixed_short: (value) => {
      builder.size += 2;
      builder.commands.push((view) => view.put_fixed_short(value));
      return builder;
    },
    bytes: (value) => {
      builder.size += 4 + value.byteLength;
      builder.commands.push((view) => view.put_bytes(value));
      return builder;
    },
    str: (value) => {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(value);
      builder.size += 4 + bytes.byteLength;
      builder.commands.push((view) => view.put_bytes(bytes));
      return builder;
    },
    data_view: () => {
      const view = new BinView(new ArrayBuffer(builder.size));
      for (const command of builder.commands) {
        command(view);
      }
      return view.data_view;
    },
    array_buffer: () => {
      return builder.data_view().buffer;
    }
  };
  return builder;
}
class BinView {
  constructor(view) {
    __publicField(this, "data_view");
    __publicField(this, "seek", 0);
    this.data_view = new DataView(view);
  }
  // ----- Put -----
  put_byte(value) {
    this.data_view.setUint8(this.seek, value);
    this.seek += 1;
    return this;
  }
  put_sbyte(value) {
    this.data_view.setInt8(this.seek, value);
    this.seek += 1;
    return this;
  }
  put_ushort(value) {
    this.data_view.setUint16(this.seek, value);
    this.seek += 2;
    return this;
  }
  put_short(value) {
    this.data_view.setInt16(this.seek, value);
    this.seek += 2;
    return this;
  }
  put_uint(value) {
    this.data_view.setUint32(this.seek, value);
    this.seek += 4;
    return this;
  }
  put_int(value) {
    this.data_view.setInt32(this.seek, value);
    this.seek += 4;
    return this;
  }
  put_ulong(value) {
    this.data_view.setBigUint64(this.seek, value);
    this.seek += 8;
    return this;
  }
  put_long(value) {
    this.data_view.setBigInt64(this.seek, value);
    this.seek += 8;
    return this;
  }
  put_float(value) {
    this.data_view.setFloat32(this.seek, value);
    this.seek += 4;
    return this;
  }
  put_double(value) {
    this.data_view.setFloat64(this.seek, value);
    this.seek += 8;
    return this;
  }
  put_fixed_sbyte(value) {
    const fixed = remap(value, -1, 1, -127, 128);
    this.put_sbyte(fixed);
    return this;
  }
  put_fixed_short(value) {
    const fixed = remap(value, -1, 1, -32768, 32767);
    this.put_short(fixed);
    return this;
  }
  // // May not be accurate due to floating points :(
  // put_fixed_int(value: number): this {
  // 	value = math.remap(value, -1.0, 1.0, -2_147_483_648, +2_147_483_648)
  // 	this.data_view.setInt32(this.seek, value); this.seek += 1
  // 	return this
  // }
  put_bytes(bytes) {
    let index = 0;
    for (const byte of bytes) {
      this.data_view.setUint8(this.seek + index, byte);
      index++;
    }
    return this;
  }
  put_str(str) {
    const text_encoder = new TextEncoder();
    const bytes = text_encoder.encode(str);
    this.put_bytes(bytes);
    return this;
  }
  // ----- Get -----
  get_byte() {
    const value = this.data_view.getUint8(this.seek);
    this.seek += 1;
    return value;
  }
  get_sbyte() {
    const value = this.data_view.getInt8(this.seek);
    this.seek += 1;
    return value;
  }
  get_ushort() {
    const value = this.data_view.getUint16(this.seek);
    this.seek += 2;
    return value;
  }
  get_short() {
    const value = this.data_view.getInt16(this.seek);
    this.seek += 2;
    return value;
  }
  get_uint() {
    const value = this.data_view.getUint32(this.seek);
    this.seek += 4;
    return value;
  }
  get_int() {
    const value = this.data_view.getInt32(this.seek);
    this.seek += 4;
    return value;
  }
  get_ulong() {
    const value = this.data_view.getBigUint64(this.seek);
    this.seek += 8;
    return value;
  }
  get_long() {
    const value = this.data_view.getBigInt64(this.seek);
    this.seek += 8;
    return value;
  }
  get_float() {
    const value = this.data_view.getFloat32(this.seek);
    this.seek += 4;
    return value;
  }
  get_double() {
    const value = this.data_view.getFloat64(this.seek);
    this.seek += 8;
    return value;
  }
  get_bytes() {
    const length2 = this.get_uint();
    const bytes = new Uint8ClampedArray(this.data_view.buffer.slice(this.seek, this.seek + length2));
    this.seek += length2;
    return bytes;
  }
  get_str() {
    const bytes = this.get_bytes();
    const decoder = new TextDecoder();
    const str = decoder.decode(bytes);
    return str;
  }
}
function fill_canvas(canvas2, resized) {
  const parent = canvas2.parentElement;
  if (!parent)
    throw new Error("This canvas has no parent.");
  const resize_observer = new ResizeObserver(
    (entries, observer) => {
      _fill_resize(canvas2, entries[0]);
      if (resized)
        resized();
    }
  );
  try {
    resize_observer.observe(parent, { box: "device-pixel-content-box" });
  } catch {
    resize_observer.observe(parent, { box: "content-box" });
  }
  return {
    destroy() {
      resize_observer.disconnect();
    }
  };
}
function _fill_resize(canvas2, entry) {
  if (entry.devicePixelContentBoxSize) {
    canvas2.width = Math.round(entry.devicePixelContentBoxSize[0].inlineSize);
    canvas2.height = Math.round(entry.devicePixelContentBoxSize[0].blockSize);
    return;
  }
  let dpr = window.devicePixelRatio;
  if (entry.contentBoxSize) {
    if (entry.contentBoxSize[0]) {
      canvas2.width = Math.round(entry.contentBoxSize[0].inlineSize * dpr);
      canvas2.height = Math.round(entry.contentBoxSize[0].blockSize * dpr);
      return;
    }
    canvas2.width = Math.round(entry.contentBoxSize.inlineSize * dpr);
    canvas2.height = Math.round(entry.contentBoxSize.blockSize * dpr);
    return;
  }
  canvas2.width = Math.round(entry.contentRect.width * dpr);
  canvas2.height = Math.round(entry.contentRect.height * dpr);
}
class Engine {
  constructor(canvas2) {
    __publicField(this, "canvas");
    __publicField(this, "ctx");
    __publicField(this, "plugins", []);
    __publicField(this, "rem", 16);
    __publicField(this, "screen_log", []);
    __publicField(this, "_is_redraw_queued", false);
    __publicField(this, "_canvas_w", -1);
    __publicField(this, "_canvas_h", -1);
    this.canvas = canvas2;
    let canvas_ctx = canvas2.getContext("2d");
    canvas_ctx.scale_factor = this.rem;
    canvas_ctx.w = 1;
    canvas_ctx.h = 1;
    this.ctx = canvas_ctx;
    canvas2.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      this.pointer_down(ev);
    });
    window.addEventListener("pointermove", (ev) => {
      ev.preventDefault();
      this.pointer_move(ev);
    });
    window.addEventListener("pointerup", (ev) => {
      ev.preventDefault();
      this.pointer_up(ev);
    });
    canvas2.addEventListener("touchstart", (ev) => {
      ev.preventDefault();
    });
  }
  create_plugin(id) {
    const plugin = {
      engine: this,
      id,
      trace: (data) => console.trace(`[${id}] `, data),
      debug: (data) => console.debug(`[${id}] `, data),
      log: (data) => console.log(`[${id}] `, data),
      warn: (data) => console.warn(`[${id}] `, data),
      error: (data) => console.error(`[${id}] `, data)
    };
    this.plugins.push(plugin);
    return plugin;
  }
  *plugin_iter() {
    for (const plugin of this.plugins) {
      yield plugin;
    }
  }
  transform_event(event) {
    return [
      event.x / this.rem,
      event.y / this.rem
    ];
  }
  queue_redraw() {
    if (this._is_redraw_queued)
      return;
    this._is_redraw_queued = true;
    requestAnimationFrame((time) => this.draw());
  }
  draw() {
    var _a, _b;
    this._is_redraw_queued = false;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.scale_factor = this.rem * window.devicePixelRatio;
    ctx.w = this.canvas.width / ctx.scale_factor;
    ctx.h = this.canvas.height / ctx.scale_factor;
    if (ctx.w != this._canvas_w || ctx.h != this._canvas_h) {
      this._canvas_w = ctx.w;
      this._canvas_h = ctx.h;
      for (const plugin of this.plugin_iter()) {
        (_a = plugin.resize) == null ? void 0 : _a.call(plugin, ctx);
      }
    }
    ctx.save();
    ctx.scale(ctx.scale_factor, ctx.scale_factor);
    for (const plugin of this.plugin_iter()) {
      ctx.save();
      (_b = plugin.draw) == null ? void 0 : _b.call(plugin, ctx);
      ctx.restore();
    }
    ctx.restore();
  }
  pointer_down(event) {
    var _a;
    const [px, py] = this.transform_event(event);
    for (const plugin of this.plugin_iter()) {
      if (!plugin.pointer_down)
        continue;
      const is_handled = (_a = plugin.pointer_down) == null ? void 0 : _a.call(plugin, event.pointerId, px, py);
      if (is_handled)
        return;
    }
  }
  pointer_move(event) {
    var _a;
    const [px, py] = this.transform_event(event);
    for (const plugin of this.plugin_iter()) {
      (_a = plugin.pointer_move) == null ? void 0 : _a.call(plugin, event.pointerId, px, py);
    }
  }
  pointer_up(event) {
    var _a;
    const [px, py] = this.transform_event(event);
    for (const plugin of this.plugin_iter()) {
      (_a = plugin.pointer_up) == null ? void 0 : _a.call(plugin, event.pointerId, px, py);
    }
  }
}
class Monitor {
  constructor(size = 100) {
    __publicField(this, "size");
    __publicField(this, "data");
    __publicField(this, "index", 1);
    __publicField(this, "current", 0);
    __publicField(this, "rolling_average", 0);
    __publicField(this, "_rolling_average_sum", 0);
    __publicField(this, "_rolling_average_count", 0);
    __publicField(this, "average", 0);
    __publicField(this, "_average_sum", 0);
    this.size = size;
    this.data = Array(size);
    this.data.fill(0);
  }
  log(num) {
    this.current = num;
    let overwritten_num = this.data[this.index];
    this.data[this.index] = num;
    this.index = (this.index + 1) % this.data.length;
    this._average_sum -= overwritten_num;
    this._average_sum += num;
    this.average = this._average_sum / this.data.length;
    this._rolling_average_sum += num;
    this._rolling_average_count++;
    this.rolling_average = this._rolling_average_sum / this._rolling_average_count;
  }
  reset_rolling_average() {
    this._rolling_average_sum = 0;
    this._rolling_average_count = 0;
    this.rolling_average = 0;
  }
  time_func(func) {
    const start_time = performance.now();
    func();
    this.log(performance.now() - start_time);
  }
  draw(ctx, y_mark = 0, x_scale = 1, y_scale = 1) {
    if (y_mark > 0) {
      ctx.globalAlpha /= 8;
      ctx.fillRect(0, y_mark * y_scale, this.data.length * x_scale, 1);
      ctx.globalAlpha *= 8;
    }
    for (let index = 0; index < this.data.length; index++) {
      const num = this.data[index];
      ctx.fillRect(index * x_scale, 0, x_scale, num * y_scale);
    }
    ctx.save();
    ctx.fillStyle = "white";
    ctx.fillRect(this.index * x_scale, 0, x_scale, this.current * y_scale);
    ctx.restore();
  }
}
const sqr = (x) => x * x;
const remap = (x, a1, b1, a2, b2) => a2 + (b2 - a2) * (x - a1) / (b1 - a1);
function length_sqr(x, y) {
  return x * x + y * y;
}
function length(x, y) {
  return Math.sqrt(x * x + y * y);
}
function distance_sqr(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return length_sqr(dx, dy);
}
function clamp_length(x, y, max_length) {
  const len = length(x, y);
  const factor = Math.min(len, max_length) / len;
  return [x * factor, y * factor];
}
const PING_BTW_MS = 250;
const CONNECTION_DROPPED_MS = 3e3;
const STORAGE_KEY_PREFIX = "gremote:";
const SESSION_STORAGE_KEY = STORAGE_KEY_PREFIX + "session_id";
const NAME_STORAGE_KEY = STORAGE_KEY_PREFIX + "name";
function filter_name(name2) {
  const MAX_LENGTH = 10;
  const ALLOWED_CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  name2 = name2.toUpperCase();
  name2.trim();
  let result = [];
  let was_space = true;
  for (const chr of name2) {
    if (result.length >= MAX_LENGTH)
      break;
    const is_space = chr === " ";
    if (is_space && was_space)
      continue;
    if (ALLOWED_CHARS.indexOf(chr) < 0)
      continue;
    result.push(chr);
    was_space = is_space;
  }
  return result.join("");
}
class Driver {
  constructor() {
    __publicField(this, "connection_state", "new");
    __publicField(this, "on_connection_changed");
    __publicField(this, "on_status_changed");
    __publicField(this, "on_message_received");
    __publicField(this, "on_opened");
    __publicField(this, "on_closed");
    __publicField(this, "on_error");
  }
  set_connection(state) {
    var _a;
    if (state === this.connection_state)
      return;
    this.connection_state = state;
    (_a = this.on_connection_changed) == null ? void 0 : _a.call(this, state);
  }
}
class RemoteProtocol {
  constructor() {
    __publicField(this, "on_ping");
    __publicField(this, "on_pong");
    __publicField(this, "on_sync");
    __publicField(this, "on_sync_all");
    __publicField(this, "on_layout");
    __publicField(this, "on_alert");
    __publicField(this, "on_banner");
    __publicField(this, "on_clear_banner");
  }
  ping(timestamp) {
    return null;
  }
  pong(timestamp) {
    return null;
  }
  session(sid) {
    return null;
  }
  name(name2) {
    return null;
  }
  leave() {
    return null;
  }
  layout_ready(id) {
    return null;
  }
  input_btn(id, is_down) {
    return null;
  }
  input_joy_move(id, x, y) {
    return null;
  }
  input_joy_down(id, x, y) {
    return null;
  }
  input_joy_up(id, x, y) {
    return null;
  }
}
function get_session_id(generate_new = false) {
  let session_id = Number(sessionStorage.getItem(SESSION_STORAGE_KEY));
  if (!session_id || generate_new) {
    session_id = new_id();
    sessionStorage.setItem(SESSION_STORAGE_KEY, session_id.toString());
  }
  return session_id;
}
function new_id() {
  return Math.floor(Math.random() * 899999) + 1e5;
}
class Widget {
  constructor(remote, id) {
    __publicField(this, "remote");
    __publicField(this, "id");
    __publicField(this, "tick", () => {
    });
    __publicField(this, "sync", () => {
    });
    __publicField(this, "down", (pid, px, py) => false);
    __publicField(this, "move", (pid, px, py) => {
    });
    __publicField(this, "up", (pid, px, py) => {
    });
    __publicField(this, "draw", (ctx) => {
    });
    this.remote = remote;
    this.id = id;
  }
}
class WSDriver extends Driver {
  constructor(address = "$_WS_ADDRESS_$") {
    super();
    __publicField(this, "name", "WebSocket");
    __publicField(this, "address");
    __publicField(this, "_ws");
    __publicField(this, "get_status", () => {
      if (!this._ws)
        return "uninitialized";
      switch (this._ws.readyState) {
        case 0:
          return "connecting";
        case 1:
          return "open";
        case 2:
          return "closing";
        case 3:
          return "closed";
      }
      return "unknown";
    });
    __publicField(this, "connect", async () => {
      return new Promise((resolve) => {
        console.log(`[WS] connecting to '${this.address}'`);
        this._ws = new WebSocket(this.address);
        this.set_connection("connecting");
        this._ws.onopen = (ev) => {
          var _a, _b;
          console.log(`[WS] opened`);
          (_a = this.on_status_changed) == null ? void 0 : _a.call(this);
          this.set_connection("connected");
          (_b = this.on_opened) == null ? void 0 : _b.call(this);
          resolve();
        };
        this._ws.onclose = (ev) => {
          var _a, _b;
          console.log(`[WS] closed`);
          (_a = this.on_status_changed) == null ? void 0 : _a.call(this);
          if (this.connection_state != "failed")
            this.set_connection("closed");
          (_b = this.on_opened) == null ? void 0 : _b.call(this);
        };
        this._ws.onerror = (ev) => {
          var _a, _b;
          console.error(`[WS] error`);
          (_a = this.on_status_changed) == null ? void 0 : _a.call(this);
          this.set_connection("failed");
          (_b = this.on_error) == null ? void 0 : _b.call(this, ev);
          this.disconnect();
        };
        this._ws.onmessage = (ev) => {
          var _a;
          return (_a = this.on_message_received) == null ? void 0 : _a.call(this, ev.data);
        };
      });
    });
    __publicField(this, "disconnect", async () => {
      var _a;
      console.log(`[WS] disconnecting`);
      (_a = this._ws) == null ? void 0 : _a.close();
    });
    __publicField(this, "send_reliable", (message) => {
      var _a;
      (_a = this._ws) == null ? void 0 : _a.send(message);
    });
    __publicField(this, "send_unreliable", (message) => {
      var _a;
      (_a = this._ws) == null ? void 0 : _a.send(message);
    });
    if (address === "" || address.startsWith("$")) {
      address = `ws://${location.hostname}:8081`;
      console.warn(`[WS] no address is defined. assuming '${address}' which may not be correct`);
    }
    this.address = address;
  }
}
class SignalingProtocol {
  constructor() {
    __publicField(this, "on_description");
    __publicField(this, "on_candidate");
  }
  parse_message(message) {
    var _a, _b;
    console.log(message);
    const dict = JSON.parse(message);
    if (!dict) {
      console.error("[signal] cannot parse packet - the packet is not valid json");
      return;
    }
    if (!dict._) {
      console.error("[signal] cannot parse packet - the packet is missing a type");
      return;
    }
    switch (dict._) {
      case "description":
        (_a = this.on_description) == null ? void 0 : _a.call(this, dict.type, dict.sdp);
        break;
      case "candidate":
        (_b = this.on_candidate) == null ? void 0 : _b.call(this, dict.candidate, dict.sdp_mid, dict.sdp_index, dict.ufrag);
        break;
      default:
        console.error("[signal] unknown packet type: ", dict._);
        break;
    }
  }
  description(type, sdp) {
    return JSON.stringify({
      _: "description",
      type,
      sdp
    });
  }
  candidate(candidate, sdp_mid, sdp_index, ufrag) {
    return JSON.stringify({
      _: "candidate",
      candidate,
      sdp_mid,
      sdp_index,
      ufrag
    });
  }
}
class RTCDriver extends Driver {
  constructor() {
    super();
    __publicField(this, "name", "WebRTC");
    __publicField(this, "_signal_protocol");
    __publicField(this, "_signal_driver");
    __publicField(this, "peer");
    __publicField(this, "reliable_channel");
    __publicField(this, "unreliable_channel");
    __publicField(this, "pending_candidates", []);
    __publicField(this, "get_status", () => {
      let statuses = [];
      if (this.peer) {
        statuses.push(`connect:${this.peer.connectionState} signal:${this.peer.signalingState} ice:${this.peer.iceConnectionState} gather:${this.peer.iceGatheringState}`);
      }
      if (this.reliable_channel) {
        statuses.push(`reliable:${this.reliable_channel.readyState}`);
      }
      if (this.unreliable_channel) {
        statuses.push(`unreliable:${this.unreliable_channel.readyState}`);
      }
      return statuses.join(" ");
    });
    __publicField(this, "connect", async () => {
      await this._signal_driver.connect();
      console.log(`[RTC] connecting`);
      this.peer = new RTCPeerConnection({
        iceServers: [
          { "urls": ["stun:stun.l.google.com:19302"] }
          // { "urls": ["stun:stun1.l.google.com:19302"] },
          // { "urls": ["stun:stun2.l.google.com:19302"] },
          // { "urls": ["stun:stun3.l.google.com:19302"] },
          // { "urls": ["stun:stun4.l.google.com:19302"] },
        ]
      });
      this.reliable_channel = this.peer.createDataChannel("reliable", { negotiated: true, id: 1, ordered: true });
      this.reliable_channel.onopen = () => {
        var _a;
        console.log("[RTC] reliable channel opened");
        (_a = this.on_status_changed) == null ? void 0 : _a.call(this);
      };
      this.reliable_channel.onclose = () => {
        var _a;
        console.log("[RTC] reliable channel closed");
        (_a = this.on_status_changed) == null ? void 0 : _a.call(this);
      };
      this.reliable_channel.onerror = (ev) => {
        var _a;
        console.log("[RTC] reliable channel error: ", ev);
        (_a = this.on_status_changed) == null ? void 0 : _a.call(this);
      };
      this.reliable_channel.onmessage = (ev) => {
        var _a;
        (_a = this.on_message_received) == null ? void 0 : _a.call(this, ev.data);
      };
      this.unreliable_channel = this.peer.createDataChannel("unreliable", { negotiated: true, id: 2, maxRetransmits: 0, ordered: false });
      this.unreliable_channel.onopen = () => {
        var _a;
        console.log("[RTC] unreliable channel opened");
        (_a = this.on_status_changed) == null ? void 0 : _a.call(this);
      };
      this.unreliable_channel.onclose = () => {
        var _a;
        console.log("[RTC] unreliable channel closed");
        (_a = this.on_status_changed) == null ? void 0 : _a.call(this);
      };
      this.unreliable_channel.onerror = (ev) => {
        var _a;
        console.log("[RTC] unreliable channel error: ", ev);
        (_a = this.on_status_changed) == null ? void 0 : _a.call(this);
      };
      this.unreliable_channel.onmessage = (ev) => {
        var _a;
        (_a = this.on_message_received) == null ? void 0 : _a.call(this, ev.data);
      };
      this.peer.oniceconnectionstatechange = (ev) => {
        var _a, _b;
        console.log("[RTC] ice:", (_a = this.peer) == null ? void 0 : _a.iceConnectionState);
        (_b = this.on_status_changed) == null ? void 0 : _b.call(this);
      };
      this.peer.onicegatheringstatechange = (ev) => {
        var _a, _b;
        console.log("[RTC] gather:", (_a = this.peer) == null ? void 0 : _a.iceGatheringState);
        (_b = this.on_status_changed) == null ? void 0 : _b.call(this);
      };
      this.peer.onicecandidateerror = (ev) => {
        var _a;
        console.error("[RTC] candidate error");
        (_a = this.on_status_changed) == null ? void 0 : _a.call(this);
      };
      this.peer.onconnectionstatechange = (ev) => {
        var _a, _b, _c;
        console.log("[RTC] connect:", this.peer.connectionState);
        (_a = this.on_status_changed) == null ? void 0 : _a.call(this);
        switch ((_b = this.peer) == null ? void 0 : _b.connectionState) {
          case "connected":
            setTimeout(() => {
              var _a2, _b2;
              this.set_connection(((_a2 = this.peer) == null ? void 0 : _a2.connectionState) || "unknown");
              (_b2 = this.on_opened) == null ? void 0 : _b2.call(this);
            }, 2e3);
            break;
          case "closed":
            (_c = this.on_closed) == null ? void 0 : _c.call(this);
            break;
        }
      };
      this.peer.onsignalingstatechange = (ev) => {
        var _a;
        console.log("[RTC] signal:", this.peer.signalingState);
        (_a = this.on_status_changed) == null ? void 0 : _a.call(this);
      };
      this.peer.onicecandidate = async (event) => {
        console.log("[RTC] generated candidate: ", event.candidate);
        if (!event.candidate || !event.candidate.candidate)
          return;
        this._signal_driver.send_reliable(this._signal_protocol.candidate(
          event.candidate.candidate,
          event.candidate.sdpMid || "",
          event.candidate.sdpMLineIndex || 0,
          event.candidate.usernameFragment || ""
        ));
      };
      this._signal_protocol.on_description = async (type, sdp) => {
        console.log(`[RTC] received ${type}:`, sdp);
        const desc = new RTCSessionDescription({ type, sdp });
        this.peer.setRemoteDescription(desc);
        for (const candidate_obj of this.pending_candidates) {
          console.log("[RTC] adding queued candidate");
          this.peer.addIceCandidate(candidate_obj);
        }
      };
      this._signal_protocol.on_candidate = async (candidate, sdp_mid, sdp_index, ufrag) => {
        var _a;
        console.log("[RTC] received candidate:", { candidate, sdp_mid, sdp_index, ufrag });
        const candidate_obj = {
          candidate,
          sdpMid: sdp_mid,
          sdpMLineIndex: sdp_index,
          usernameFragment: ufrag
        };
        if ((_a = this.peer) == null ? void 0 : _a.remoteDescription) {
          console.log("[RTC] adding candidate immediately");
          this.peer.addIceCandidate(candidate_obj);
        } else {
          console.log("[RTC] adding candidate to queue");
          this.pending_candidates.push(candidate_obj);
        }
      };
      const offer = await this.peer.createOffer();
      console.log("[RTC] created offer:", offer);
      console.log("[RTC] setting local description to offer");
      await this.peer.setLocalDescription(offer);
      console.log("[RTC] sending offer");
      this._signal_driver.send_reliable(this._signal_protocol.description(offer.type, offer.sdp ?? ""));
    });
    __publicField(this, "disconnect", async () => {
      var _a, _b, _c;
      console.log("[RTC] disconnecting");
      this._signal_driver.disconnect();
      (_a = this.reliable_channel) == null ? void 0 : _a.close();
      (_b = this.unreliable_channel) == null ? void 0 : _b.close();
      (_c = this.peer) == null ? void 0 : _c.close();
      this.reliable_channel = void 0;
      this.unreliable_channel = void 0;
      this.peer = void 0;
    });
    __publicField(this, "send_reliable", (message) => {
      var _a, _b;
      if (((_a = this.reliable_channel) == null ? void 0 : _a.readyState) != "open")
        return;
      (_b = this.reliable_channel) == null ? void 0 : _b.send(message);
    });
    __publicField(this, "send_unreliable", (message) => {
      var _a, _b;
      if (((_a = this.unreliable_channel) == null ? void 0 : _a.readyState) != "open")
        return;
      (_b = this.unreliable_channel) == null ? void 0 : _b.send(message);
    });
    this._signal_protocol = new SignalingProtocol();
    this._signal_driver = new WSDriver("$_SIGNAL_WS_ADDRESS_$");
    this._signal_driver.on_message_received = (message) => this._signal_protocol.parse_message(message);
  }
}
class BinaryProtocol extends RemoteProtocol {
  constructor(fallback_protocol) {
    super();
    __publicField(this, "fallback_protocol");
    this.fallback_protocol = fallback_protocol;
    fallback_protocol.on_alert = this.on_alert;
    fallback_protocol.on_banner = this.on_banner;
    fallback_protocol.on_clear_banner = this.on_clear_banner;
    fallback_protocol.on_layout = this.on_layout;
    fallback_protocol.on_ping = this.on_ping;
    fallback_protocol.on_pong = this.on_pong;
    fallback_protocol.on_sync = this.on_sync;
    fallback_protocol.on_sync_all = this.on_sync_all;
    this.layout_ready = fallback_protocol.layout_ready;
  }
  parse_message(message) {
    var _a, _b;
    if (typeof message === "string") {
      this.fallback_protocol.parse_message(message);
      return;
    }
    if (!(message instanceof ArrayBuffer)) {
      console.warn("[BIN] unexpected message data:", message);
      return;
    }
    const bin2 = new BinView(message);
    const type = bin2.get_byte();
    switch (type) {
      case 0: {
        const json = bin2.get_str();
        this.fallback_protocol.parse_message(json);
        break;
      }
      case 1: {
        const sts = bin2.get_uint();
        (_a = this.on_ping) == null ? void 0 : _a.call(this, sts);
        break;
      }
      case 2: {
        const sts = bin2.get_uint();
        (_b = this.on_pong) == null ? void 0 : _b.call(this, sts);
        break;
      }
    }
  }
  text_packet(message) {
    return bin().byte(0).str(message).array_buffer();
  }
  input_btn(id, down) {
    return bin().byte(id + (down ? 0 : 1)).array_buffer();
  }
  input_joy_move(id, x, y) {
    return bin().byte(id).fixed_sbyte(x).fixed_sbyte(y).array_buffer();
  }
  input_joy_down(id, x, y) {
    return bin().byte(id + 1).fixed_sbyte(x).fixed_sbyte(y).array_buffer();
  }
  input_joy_up(id, x, y) {
    return bin().byte(id + 2).fixed_sbyte(x).fixed_sbyte(y).array_buffer();
  }
}
class JSONProtocol extends RemoteProtocol {
  parse_message(message) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const dict = JSON.parse(message);
    if (!dict) {
      console.error("[JSON] cannot parse message - the message is not valid json");
      return;
    }
    if (!dict._) {
      console.error("[JSON] cannot parse message - the message is missing a type");
      return;
    }
    switch (dict._) {
      case "ping":
        (_a = this.on_ping) == null ? void 0 : _a.call(this, dict.t);
        break;
      case "pong":
        (_b = this.on_pong) == null ? void 0 : _b.call(this, dict.t);
        break;
      case "sync":
        (_c = this.on_sync) == null ? void 0 : _c.call(this, dict.id);
        break;
      case "sync_all":
        (_d = this.on_sync_all) == null ? void 0 : _d.call(this);
        break;
      case "layout":
        (_e = this.on_layout) == null ? void 0 : _e.call(this, dict.id);
        break;
      case "alert":
        (_f = this.on_alert) == null ? void 0 : _f.call(this, dict.title, dict.body);
        break;
      case "banner":
        (_g = this.on_banner) == null ? void 0 : _g.call(this, dict.text);
        break;
      case "clear_banner":
        (_h = this.on_clear_banner) == null ? void 0 : _h.call(this);
        break;
      default:
        console.error("[JSON] unknown packet type: ", dict._);
        break;
    }
  }
  round(x) {
    return Math.round(x * 100) / 100;
  }
  ping(timestamp) {
    return JSON.stringify({
      _: "ping",
      t: timestamp
    });
  }
  pong(timestamp) {
    return JSON.stringify({
      _: "pong",
      t: timestamp
    });
  }
  session(sid) {
    return JSON.stringify({
      _: "session",
      sid
    });
  }
  name(name2) {
    return JSON.stringify({
      _: "name",
      name: name2
    });
  }
  leave() {
    return JSON.stringify({
      _: "leave"
    });
  }
  layout_ready(id) {
    return JSON.stringify({
      _: "layout_ready",
      id
    });
  }
  input_btn(id, is_down) {
    return JSON.stringify({
      _: "input",
      id,
      t: Date.now(),
      d: is_down
    });
  }
  input_joy_move(id, x, y) {
    return JSON.stringify({
      _: "input",
      id,
      t: Date.now(),
      x: this.round(x),
      y: this.round(y)
    });
  }
  input_joy_down(id, x, y) {
    return JSON.stringify({
      _: "input",
      id,
      t: Date.now(),
      d: "down",
      x: this.round(x),
      y: this.round(y)
    });
  }
  input_joy_up(id, x, y) {
    return JSON.stringify({
      _: "input",
      id,
      t: Date.now(),
      d: "up",
      x: this.round(x),
      y: this.round(y)
    });
  }
}
class Remote extends Engine {
  constructor(canvas2) {
    super(canvas2);
    __publicField(this, "driver_type", "$_DRIVER_$");
    __publicField(this, "protocol_type", "$_PROTOCOL_$");
    __publicField(this, "protocol");
    __publicField(this, "driver");
    __publicField(this, "send_queue", []);
    __publicField(this, "name", "(unnamed)");
    __publicField(this, "session_id");
    __publicField(this, "tick_rate", 30);
    __publicField(this, "is_connection_dropped", false);
    if (this.driver_type.startsWith("$")) {
      this.driver_type = "RTC";
      console.warn(`[Remote] no driver is defined - assuming '${this.driver_type}' which may not be correct`);
    } else {
      console.log("[Remote] driver:", this.driver_type);
    }
    if (this.protocol_type.startsWith("$")) {
      this.protocol_type = "JSON";
      console.warn(`[Remote] no protocol is defined - assuming '${this.protocol_type}' which may not be correct`);
    } else {
      console.log("[Remote] protocol:", this.protocol_type);
    }
    switch (this.driver_type) {
      default:
        throw new Error("[Remote] unknown driver type: " + this.driver_type);
      case "WS":
        this.driver = new WSDriver();
        break;
      case "RTC":
        this.driver = new RTCDriver();
        break;
    }
    switch (this.protocol_type) {
      default:
        throw new Error("[Remote] unknown protocol type: " + this.protocol_type);
      case "JSON":
        this.protocol = new JSONProtocol();
        break;
      case "BIN/JSON":
        this.protocol = new BinaryProtocol(new JSONProtocol());
        break;
    }
    this.driver.on_message_received = (message) => this.protocol.parse_message(message);
    this.session_id = get_session_id();
    console.log("[Remote] session id:", this.session_id);
    this.send(this.protocol.session(this.session_id));
    this.tick();
    this.driver.on_connection_changed = (state) => {
      var _a, _b;
      if (state === "connected") {
        for (const plugin of this.plugin_iter()) {
          (_a = plugin.connected) == null ? void 0 : _a.call(plugin);
        }
        for (const message of this.send_queue) {
          this.driver.send_reliable(message);
        }
      } else {
        for (const plugin of this.plugin_iter()) {
          (_b = plugin.disconnected) == null ? void 0 : _b.call(plugin);
        }
      }
    };
  }
  async connect() {
    window.scroll({ left: 0, top: 0 });
    await this.driver.connect();
    window.scroll({ left: 0, top: 0 });
  }
  async disconnect() {
    await this.driver.disconnect();
  }
  create_plugin(id) {
    const plugin = {
      id,
      engine: this,
      remote: this,
      trace: (data) => console.trace(`[${id}] `, data),
      debug: (data) => console.debug(`[${id}] `, data),
      log: (data) => console.log(`[${id}] `, data),
      warn: (data) => console.warn(`[${id}] `, data),
      error: (data) => console.error(`[${id}] `, data)
    };
    this.plugins.push(plugin);
    return plugin;
  }
  tick() {
    var _a;
    for (const plugin of this.plugin_iter()) {
      (_a = plugin.tick) == null ? void 0 : _a.call(plugin);
    }
    setTimeout(() => this.tick(), 1e3 / this.tick_rate);
  }
  set_connection_dropped(is_connection_dropped) {
    var _a, _b;
    if (this.is_connection_dropped == is_connection_dropped)
      return;
    this.is_connection_dropped = is_connection_dropped;
    for (const plugin of this.plugin_iter()) {
      const remote_plugin = plugin;
      if (is_connection_dropped)
        (_a = remote_plugin == null ? void 0 : remote_plugin.connection_dropped) == null ? void 0 : _a.call(remote_plugin);
      else
        (_b = remote_plugin == null ? void 0 : remote_plugin.connection_regained) == null ? void 0 : _b.call(remote_plugin);
    }
  }
  send(message) {
    if (this.driver.connection_state === "connected") {
      this.driver.send_reliable(message);
      return;
    }
    this.send_queue.push(message);
  }
}
class Button extends Widget {
  constructor(remote, id, options) {
    super(remote, id);
    __publicField(this, "cx");
    __publicField(this, "cy");
    __publicField(this, "r");
    __publicField(this, "label");
    __publicField(this, "thickness");
    __publicField(this, "_pid", 0);
    __publicField(this, "_is_active", false);
    __publicField(this, "sync", () => {
      this.remote.driver.send_reliable(this.remote.protocol.input_btn(this.id, this._is_active));
    });
    __publicField(this, "is_inside", (x, y) => {
      return distance_sqr(this.cx, this.cy, x, y) <= sqr(this.r);
    });
    __publicField(this, "down", (pid, px, py) => {
      if (this._is_active)
        return false;
      if (!this.is_inside(px, py))
        return false;
      this._is_active = true;
      this._pid = pid;
      this.sync();
      this.remote.queue_redraw();
      return true;
    });
    __publicField(this, "up", (pid, px, py) => {
      if (!this._is_active)
        return;
      if (this._pid != pid)
        return;
      this._is_active = false;
      this.sync();
      this.remote.queue_redraw();
    });
    __publicField(this, "draw", (ctx) => {
      ctx.translate(this.cx, this.cy);
      ctx.beginPath();
      ctx.ellipse(0, 0, this.r, this.r, 0, 0, 7);
      if (this._is_active) {
        ctx.fill();
      }
      ctx.lineWidth = this.thickness;
      ctx.stroke();
      if (!this.label)
        return;
      if (this._is_active) {
        ctx.globalCompositeOperation = "destination-out";
      }
      ctx.font = `bold ${this.r}px Bespoke Sans`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.label, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    });
    this.cx = options.cx;
    this.cy = options.cy;
    this.r = (options == null ? void 0 : options.r) || 3;
    this.label = options == null ? void 0 : options.label;
    this.thickness = options.thickness || 0.5;
  }
}
class Joystick extends Widget {
  constructor(remote, id, options) {
    super(remote, id);
    __publicField(this, "label");
    __publicField(this, "cx");
    __publicField(this, "cy");
    __publicField(this, "touch_radius");
    __publicField(this, "track_radius");
    __publicField(this, "ring_radius");
    __publicField(this, "ring_thickness");
    __publicField(this, "stick_radius");
    __publicField(this, "stick_outline");
    __publicField(this, "stick_thickness");
    __publicField(this, "stick_x", 0);
    __publicField(this, "stick_y", 0);
    __publicField(this, "_pid", 0);
    __publicField(this, "_is_active", false);
    __publicField(this, "tick", () => {
      this.sync();
    });
    __publicField(this, "sync", () => {
      this.remote.driver.send_unreliable(this.remote.protocol.input_joy_move(this.id, this.stick_x, this.stick_y));
    });
    __publicField(this, "is_inside_touch", (x, y) => {
      return distance_sqr(this.cx, this.cy, x, y) <= sqr(this.touch_radius);
    });
    __publicField(this, "down", (pid, px, py) => {
      if (this._is_active)
        return false;
      if (!this.is_inside_touch(px, py))
        return false;
      this._is_active = true;
      this._pid = pid;
      this.move(pid, px, py);
      this.remote.driver.send_reliable(this.remote.protocol.input_joy_down(this.id, this.stick_x, this.stick_y));
      this.sync();
      return true;
    });
    __publicField(this, "move", (pid, px, py) => {
      if (!this._is_active)
        return;
      if (this._pid != pid)
        return;
      this.stick_x = (px - this.cx) / this.track_radius;
      this.stick_y = (py - this.cy) / this.track_radius;
      [this.stick_x, this.stick_y] = clamp_length(this.stick_x, this.stick_y, 1);
      this.remote.queue_redraw();
    });
    __publicField(this, "up", (pid, px, py) => {
      if (!this._is_active)
        return;
      if (this._pid != pid)
        return;
      this.stick_x = 0;
      this.stick_y = 0;
      this._is_active = false;
      this.remote.driver.send_reliable(this.remote.protocol.input_joy_up(this.id, this.stick_x, this.stick_y));
      this.sync();
      this.remote.queue_redraw();
    });
    __publicField(this, "draw", (ctx) => {
      const stick_px = this.stick_x * this.track_radius;
      const stick_py = this.stick_y * this.track_radius;
      ctx.translate(this.cx, this.cy);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.ellipse(0, 0, this.ring_radius, this.ring_radius, 0, 0, 7);
      ctx.lineWidth = this.ring_thickness;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(stick_px, stick_py, this.stick_radius + this.stick_outline, this.stick_radius + this.stick_outline, 0, 0, 7);
      ctx.globalCompositeOperation = "destination-out";
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(stick_px, stick_py);
      ctx.lineWidth = this.stick_thickness;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(stick_px, stick_py, this.stick_radius, this.stick_radius, 0, 0, 7);
      ctx.fill();
      if (!this.label)
        return;
      ctx.font = `bold ${this.stick_radius}px Bespoke Sans`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillText(this.label, stick_px, stick_py);
      ctx.globalCompositeOperation = "source-over";
    });
    this.label = options == null ? void 0 : options.label;
    this.cx = options.cx;
    this.cy = options.cy;
    this.touch_radius = (options == null ? void 0 : options.touch_radius) || 10;
    this.track_radius = (options == null ? void 0 : options.track_radius) || 2;
    this.ring_radius = 5;
    this.ring_thickness = 0.5;
    this.stick_radius = options.stick_radius || 3;
    this.stick_outline = 0.5;
    this.stick_thickness = 1;
  }
}
class MenuButton extends Widget {
  constructor(remote, callback, options) {
    super(remote, "");
    __publicField(this, "callback");
    __publicField(this, "cx");
    __publicField(this, "cy");
    __publicField(this, "r");
    __publicField(this, "icon");
    __publicField(this, "_pid", 0);
    __publicField(this, "_is_active", false);
    __publicField(this, "is_inside", (x, y) => {
      return distance_sqr(this.cx, this.cy, x, y) <= sqr(this.r);
    });
    __publicField(this, "down", (pid, px, py) => {
      if (this._is_active)
        return false;
      if (!this.is_inside(px, py))
        return false;
      this._is_active = true;
      this._pid = pid;
      this.remote.queue_redraw();
      return true;
    });
    __publicField(this, "up", (pid, px, py) => {
      var _a;
      if (!this._is_active)
        return;
      if (this._pid != pid)
        return;
      this._is_active = false;
      this.remote.queue_redraw();
      if (this.is_inside(px, py)) {
        (_a = this.callback) == null ? void 0 : _a.call(this);
      }
    });
    __publicField(this, "draw", (ctx) => {
      ctx.translate(this.cx, this.cy);
      if (this._is_active) {
        ctx.scale(0.9, 0.9);
      }
      ctx.beginPath();
      switch (this.icon) {
        case "menu":
          ctx.moveTo(-1, -0.5);
          ctx.lineTo(1, -0.5);
          ctx.moveTo(-1, 0);
          ctx.lineTo(1, 0);
          ctx.moveTo(-1, 0.5);
          ctx.lineTo(1, 0.5);
          ctx.lineWidth = 0.25;
          ctx.stroke();
          break;
        case "pause":
          ctx.lineWidth = 0.25;
          ctx.moveTo(-0.5, -1);
          ctx.lineTo(-0.5, 1);
          ctx.moveTo(0.5, -1);
          ctx.lineTo(0.5, 1);
          ctx.lineWidth = 0.5;
          ctx.stroke();
          break;
        case "none":
        default:
          ctx.moveTo(-1, -1);
          ctx.lineTo(1, -1);
          ctx.lineTo(1, 1);
          ctx.lineTo(-1, 1);
          ctx.closePath();
          ctx.lineTo(1, 1);
          ctx.lineWidth = 0.25;
          ctx.stroke();
          break;
      }
    });
    this.callback = callback;
    this.cx = options == null ? void 0 : options.cx;
    this.cy = options == null ? void 0 : options.cy;
    this.r = 2;
    this.icon = options.icon || "none";
  }
}
const controls = (plugin) => {
  let widgets = [];
  plugin.resize = (ctx) => {
    widgets = [
      new MenuButton(plugin.remote, () => {
        window.remote_open_menu();
      }, { icon: "menu", cx: 2, cy: 2 }),
      new MenuButton(plugin.remote, () => {
      }, { icon: "pause", cx: ctx.w - 2, cy: 2 }),
      new Joystick(plugin.remote, "l", { label: "L", cx: 8, cy: ctx.h - 8 }),
      new Button(plugin.remote, "a", { label: "A", cx: ctx.w - 4, cy: ctx.h - 9 }),
      new Button(plugin.remote, "b", { label: "B", cx: ctx.w - 9, cy: ctx.h - 4 }),
      new Button(plugin.remote, "x", { label: "X", cx: ctx.w - 9, cy: ctx.h - 14 }),
      new Button(plugin.remote, "y", { label: "Y", cx: ctx.w - 14, cy: ctx.h - 9 })
    ];
    for (const widget of widgets) {
      widget.sync();
    }
  };
  plugin.tick = () => {
    for (const widget of widgets) {
      widget.tick();
    }
  };
  plugin.draw = (ctx) => {
    const is_connected = plugin.remote.driver.connection_state == "connected";
    ctx.fillStyle = is_connected ? "white" : "rgb(64 64 64)";
    ctx.strokeStyle = is_connected ? "white" : "rgb(64 64 64)";
    for (const widget of widgets) {
      ctx.save();
      widget.draw(ctx);
      ctx.restore();
    }
  };
  plugin.pointer_down = (pid, px, py) => {
    for (const widget of widgets) {
      const is_handled = widget.down(pid, px, py);
      if (is_handled)
        return true;
    }
    return false;
  };
  plugin.pointer_move = (pid, px, py) => {
    for (const widget of widgets) {
      widget.move(pid, px, py);
    }
    return false;
  };
  plugin.pointer_up = (pid, px, py) => {
    for (const widget of widgets) {
      widget.up(pid, px, py);
    }
    return false;
  };
};
const debug = (plugin) => {
  plugin.remote.driver.on_status_changed = () => plugin.engine.queue_redraw();
  plugin.draw = (ctx) => {
    let texts = plugin.engine.screen_log.slice();
    if (texts.length == 0)
      return;
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.font = "bold 1px monospace";
    ctx.fillStyle = "white";
    ctx.fillText(texts.join(" "), ctx.w / 2, 2.5, ctx.w * 0.75);
  };
};
const leave = (plugin) => {
  const leave_dialog = document.getElementById("leave-dialog");
  const leave2 = () => {
    plugin.remote.send(plugin.remote.protocol.leave());
    setTimeout(() => {
      plugin.remote.disconnect();
      window.close();
    }, 1e3);
  };
  window.remote_leave = leave2;
  const show_leave_dialog = () => {
    window.remote_close_menu();
    leave_dialog.inert = true;
    leave_dialog.showModal();
    leave_dialog.inert = false;
  };
  window.remote_open_leave_dialog = show_leave_dialog;
};
const menu = (plugin) => {
  let is_menu_open = false;
  const update_menu = () => {
    document.body.classList.toggle("menu-open", is_menu_open);
  };
  const open_menu = () => {
    is_menu_open = true;
    update_menu();
  };
  window.remote_open_menu = open_menu;
  const close_menu = () => {
    is_menu_open = false;
    update_menu();
  };
  window.remote_close_menu = close_menu;
  plugin.pointer_down = (pid, px, py) => {
    window.scroll({ left: 0, top: 0 });
    if (!is_menu_open)
      return false;
    close_menu();
    return true;
  };
  close_menu();
};
const name = (plugin) => {
  const name_dialog = document.getElementById("name-dialog");
  const name_input = document.getElementById("name-input");
  const name_span = document.getElementById("name");
  const show_name_dialog = () => {
    window.remote_close_menu();
    name_input.value = "";
    name_dialog.inert = true;
    name_dialog.showModal();
    name_dialog.inert = false;
  };
  window.remote_open_name_dialog = show_name_dialog;
  let current_name = "(no name)";
  const set_name = (new_name) => {
    new_name = filter_name(new_name);
    if (new_name.length > 0) {
      current_name = new_name;
    }
    name_span.textContent = new_name;
    sessionStorage.setItem(NAME_STORAGE_KEY, current_name);
    plugin.remote.send(plugin.remote.protocol.name(current_name));
  };
  name_dialog.addEventListener("close", (ev) => {
    set_name(name_input.value);
    window.scroll({ left: 0, top: 0 });
  });
  const stored_name = sessionStorage.getItem(NAME_STORAGE_KEY);
  if (stored_name)
    set_name(stored_name);
  else
    show_name_dialog();
};
const ping = (plugin) => {
  let is_connected = false;
  let sent_pings = 0;
  let received_pings = 0;
  let last_ping_receive_time = Date.now();
  let monitor = new Monitor();
  const send_ping = () => {
    const sts = Date.now();
    const payload = plugin.remote.protocol.ping(sts);
    plugin.remote.driver.send_unreliable(payload);
    sent_pings++;
  };
  plugin.connected = () => {
    last_ping_receive_time = Date.now();
    is_connected = true;
  };
  plugin.draw = (ctx) => {
    if (plugin.remote.driver.connection_state != "connected")
      return;
    if (plugin.remote.is_connection_dropped)
      return;
    {
      ctx.save();
      ctx.resetTransform();
      ctx.translate(ctx.canvas.width / 2 - monitor.size, 0);
      ctx.fillStyle = "rgb(64 64 64)";
      monitor.draw(ctx, 0, 2, 1);
      ctx.restore();
    }
    {
      ctx.textBaseline = "top";
      ctx.textAlign = "center";
      ctx.font = "bold 1px monospace";
      ctx.fillStyle = "rgb(128 128 128)";
      ctx.fillText(`${monitor.current}ms ${Math.floor(received_pings / sent_pings * 100)}%`, ctx.w / 2, 1);
    }
  };
  plugin.remote.protocol.on_pong = (sts) => {
    received_pings++;
    last_ping_receive_time = Date.now();
    const ping_ms = Date.now() - sts;
    monitor.log(ping_ms);
    plugin.remote.set_connection_dropped(false);
    {
      plugin.remote.queue_redraw();
    }
  };
  setInterval(() => {
    if (!is_connected)
      return;
    send_ping();
    const delta = Date.now() - last_ping_receive_time;
    if (delta > CONNECTION_DROPPED_MS) {
      plugin.remote.set_connection_dropped(true);
      plugin.remote.queue_redraw();
    }
  }, PING_BTW_MS);
};
const toasts = (plugin) => {
  const spinner_element = document.getElementById("spinner");
  const reload_element = document.getElementById("reload");
  plugin.connected = () => {
    spinner_element.style.visibility = "hidden";
    reload_element.style.visibility = "hidden";
  };
  plugin.disconnected = () => {
    spinner_element.style.visibility = "hidden";
    reload_element.style.visibility = "visible";
  };
  plugin.connection_regained = () => {
    spinner_element.style.visibility = "hidden";
    reload_element.style.visibility = "hidden";
  };
  plugin.connection_dropped = () => {
    spinner_element.style.visibility = "hidden";
    reload_element.style.visibility = "visible";
  };
  spinner_element.style.visibility = "visible";
  reload_element.style.visibility = "hidden";
};
const canvas = document.getElementById("canvas");
const engine = new Remote(canvas);
debug(engine.create_plugin("debug"));
leave(engine.create_plugin("leave"));
name(engine.create_plugin("name"));
menu(engine.create_plugin("menu"));
toasts(engine.create_plugin("toasts"));
ping(engine.create_plugin("ping"));
controls(engine.create_plugin("controls"));
fill_canvas(canvas, () => engine.queue_redraw());
engine.queue_redraw();
engine.connect();
