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
const index = "";
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  if (!deps || deps.length === 0) {
    return baseModule();
  }
  const links = document.getElementsByTagName("link");
  return Promise.all(deps.map((dep) => {
    dep = assetsURL(dep);
    if (dep in seen)
      return;
    seen[dep] = true;
    const isCss = dep.endsWith(".css");
    const cssSelector = isCss ? '[rel="stylesheet"]' : "";
    const isBaseRelative = !!importerUrl;
    if (isBaseRelative) {
      for (let i = links.length - 1; i >= 0; i--) {
        const link2 = links[i];
        if (link2.href === dep && (!isCss || link2.rel === "stylesheet")) {
          return;
        }
      }
    } else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
      return;
    }
    const link = document.createElement("link");
    link.rel = isCss ? "stylesheet" : scriptRel;
    if (!isCss) {
      link.as = "script";
      link.crossOrigin = "";
    }
    link.href = dep;
    document.head.appendChild(link);
    if (isCss) {
      return new Promise((res, rej) => {
        link.addEventListener("load", res);
        link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${dep}`)));
      });
    }
  })).then(() => baseModule()).catch((err) => {
    const e = new Event("vite:preloadError", { cancelable: true });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  });
};
function fill_canvas(canvas, resized) {
  const parent = canvas.parentElement;
  if (!parent)
    throw new Error("This canvas has no parent.");
  const resize_observer = new ResizeObserver(
    (entries, observer) => {
      _fill_resize(canvas, entries[0]);
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
function _fill_resize(canvas, entry) {
  if (entry.devicePixelContentBoxSize) {
    canvas.width = Math.round(entry.devicePixelContentBoxSize[0].inlineSize);
    canvas.height = Math.round(entry.devicePixelContentBoxSize[0].blockSize);
    return;
  }
  let dpr = window.devicePixelRatio;
  if (entry.contentBoxSize) {
    if (entry.contentBoxSize[0]) {
      canvas.width = Math.round(entry.contentBoxSize[0].inlineSize * dpr);
      canvas.height = Math.round(entry.contentBoxSize[0].blockSize * dpr);
      return;
    }
    canvas.width = Math.round(entry.contentBoxSize.inlineSize * dpr);
    canvas.height = Math.round(entry.contentBoxSize.blockSize * dpr);
    return;
  }
  canvas.width = Math.round(entry.contentRect.width * dpr);
  canvas.height = Math.round(entry.contentRect.height * dpr);
}
const AUTO_SYNC_RATE = 20;
const PING_TIME = 3e3;
const UNIT_SIZE = 16;
const SESSION_STORAGE_KEY = "gremote:session_id";
function create_client(api) {
  const client = {
    api,
    reconnect_address: "",
    auto_reconnect: true,
    is_connected: false,
    status: "Connecting...",
    connect(address) {
      client.reconnect_address = address;
      api.driver.connect(address);
    },
    session_id: 0,
    ongoing_pings: 0,
    last_pong_timestamp: 0,
    last_ping: 0,
    ping_sum: 0,
    ping_count: 0,
    get_avg_ping: () => Math.max(client.ping_sum / client.ping_count, 0),
    ping_server() {
      client.ongoing_pings++;
      client.api.send_ping(Date.now());
    }
  };
  const new_session_id = Math.floor(Math.random() * 1e5);
  client.session_id = Number(sessionStorage.getItem(SESSION_STORAGE_KEY) || new_session_id);
  sessionStorage.setItem(SESSION_STORAGE_KEY, client.session_id.toString());
  document.getElementById("menu_session_id").textContent = "#" + client.session_id;
  client.api.receive_ping = (sts) => {
    client.api.send_pong(sts, Date.now());
  };
  client.api.receive_pong = (sts, rts) => {
    const now = Date.now();
    const ping = now - sts;
    client.ongoing_pings--;
    client.last_ping = ping;
    client.last_pong_timestamp = now;
    client.ping_sum += ping;
    client.ping_count++;
  };
  client.api.driver.on_open = () => {
    console.log("[Client] Connected.");
    client.is_connected = true;
    client.ping_count = 0;
    client.ping_sum = 0;
    client.ongoing_pings = 0;
    client.last_ping = 0;
    client.last_pong_timestamp = 0;
    api.send_session(client.session_id);
  };
  client.api.driver.on_close = () => {
    client.is_connected = false;
    if (client.auto_reconnect) {
      console.log("[Client] Auto reconnecting due to disconnect.");
      client.api.driver.connect(client.reconnect_address);
    }
  };
  return client;
}
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
function angle(x, y) {
  return Math.atan2(y, x);
}
function from_angle(angle_rad, length2) {
  return [Math.cos(angle_rad) * length2, Math.sin(angle_rad) * length2];
}
function create_button(client, id, options) {
  const label = (options == null ? void 0 : options.label) || "";
  const center_x = (options == null ? void 0 : options.center_x) || 0;
  const center_y = (options == null ? void 0 : options.center_y) || 0;
  const radius = (options == null ? void 0 : options.radius) || 3;
  const outline_thickness = 0.5;
  let pointer_id = 0;
  let is_active = false;
  let synced_active = false;
  const button = {
    client,
    sync(forced) {
      if (!client.is_connected)
        return;
      if (!forced) {
        if (synced_active == is_active)
          return;
      }
      synced_active = is_active;
      client.api.send_input_btn(id, synced_active);
    },
    down(x, y, pid) {
      if (is_active)
        return;
      if (distance_sqr(center_x, center_y, x, y) <= radius * radius) {
        is_active = true;
        pointer_id = pid;
        button.sync(false);
      }
    },
    up(x, y, pid) {
      if (!is_active)
        return;
      if (pid != pointer_id)
        return;
      is_active = false;
      button.sync(false);
    },
    render(ctx) {
      ctx.translate(center_x, center_y);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius, 0, 0, 7);
      if (is_active) {
        ctx.fill();
      }
      ctx.lineWidth = outline_thickness;
      ctx.stroke();
      if (is_active) {
        ctx.globalCompositeOperation = "destination-out";
      }
      ctx.font = `bold ${radius}px Bespoke Sans`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    }
  };
  return button;
}
function create_joystick(client, id, options) {
  const radius = (options == null ? void 0 : options.radius) || 4;
  const padding = (options == null ? void 0 : options.padding) || 1;
  const bounds_thickness = 0.5;
  const line = 1;
  const handle_radius = 3;
  const handle_outline = 0.5;
  const label = (options == null ? void 0 : options.label) || "";
  const high_precision = (options == null ? void 0 : options.high_precision) || false;
  const number_of_angles = 8;
  const steps_of_precision = 2;
  let active = false;
  let pointer_id = 0;
  let center_x = (options == null ? void 0 : options.center_x) || 0;
  let center_y = (options == null ? void 0 : options.center_y) || 0;
  let stick_x = 0;
  let stick_y = 0;
  let synced_x = 0;
  let synced_y = 0;
  const joystick = {
    client,
    sync(forced) {
      if (!client.is_connected)
        return;
      let x = stick_x;
      let y = stick_y;
      if (!high_precision) {
        let ang = angle(stick_x, stick_y);
        let len = length(stick_x, stick_y);
        const angles_of_precision = number_of_angles / (2 * Math.PI);
        ang = Math.round(ang * angles_of_precision) / angles_of_precision;
        len = Math.round(len * steps_of_precision) / steps_of_precision;
        const vec = from_angle(ang, len);
        x = vec[0];
        y = vec[1];
      }
      if (!forced) {
        if (x == synced_x && y == synced_y)
          return;
      }
      synced_x = x;
      synced_y = y;
      client.api.send_input_joy(id, synced_x, synced_y);
    },
    down(x, y, pid) {
      if (active)
        return;
      if (distance_sqr(center_x, center_y, x, y) <= (radius + padding) * (radius + padding)) {
        active = true;
        pointer_id = pid;
      }
      joystick.sync(false);
    },
    move(x, y, pid) {
      if (!active)
        return;
      if (pid != pointer_id)
        return;
      stick_x = (x - center_x) / radius;
      stick_y = (y - center_y) / radius;
      const vec = clamp_length(stick_x, stick_y, 1);
      stick_x = vec[0];
      stick_y = vec[1];
    },
    up(x, y, pid) {
      if (!active)
        return;
      if (pid != pointer_id)
        return;
      active = false;
      stick_x = 0;
      stick_y = 0;
      joystick.sync(false);
    },
    render(ctx) {
      ctx.translate(center_x, center_y);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.ellipse(0, 0, radius + padding, radius + padding, 0, 0, 7);
      ctx.lineWidth = bounds_thickness;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(stick_x * radius, stick_y * radius, handle_radius + handle_outline, handle_radius + handle_outline, 0, 0, 7);
      ctx.globalCompositeOperation = "destination-out";
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(stick_x * radius, stick_y * radius);
      ctx.lineWidth = line;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(stick_x * radius, stick_y * radius, handle_radius, handle_radius, 0, 0, 7);
      ctx.fill();
      ctx.font = `bold ${handle_radius}px Bespoke Sans`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillText(label, stick_x * radius, stick_y * radius);
      ctx.globalCompositeOperation = "source-over";
    }
  };
  return joystick;
}
function create_icon_button(client, on_press, options) {
  const center_x = (options == null ? void 0 : options.center_x) || 0;
  const center_y = (options == null ? void 0 : options.center_y) || 0;
  const icon = (options == null ? void 0 : options.icon) || "none";
  let pointer_id = 0;
  let is_active = false;
  const button = {
    client,
    down(x, y, pid) {
      if (is_active)
        return;
      if (distance_sqr(center_x, center_y, x, y) <= 4) {
        is_active = true;
        pointer_id = pid;
      }
    },
    up(x, y, pid) {
      if (!is_active)
        return;
      if (pid != pointer_id)
        return;
      is_active = false;
      on_press();
    },
    render(ctx) {
      ctx.translate(center_x, center_y);
      ctx.beginPath();
      if (is_active) {
        ctx.scale(0.9, 0.9);
      }
      switch (icon) {
        case "none":
          ctx.moveTo(-1, -1);
          ctx.lineTo(1, -1);
          ctx.lineTo(1, 1);
          ctx.lineTo(-1, 1);
          ctx.closePath();
          ctx.lineTo(1, 1);
          ctx.lineWidth = 0.25;
          ctx.stroke();
          break;
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
          ctx.moveTo(-1, 0);
          ctx.lineTo(1, 0);
          ctx.moveTo(0, -1);
          ctx.lineTo(0, 1);
          ctx.lineWidth = 0.25;
          ctx.stroke();
          break;
      }
    }
  };
  return button;
}
function create_json_api(driver) {
  function round(x) {
    return Math.round(x * 100) / 100;
  }
  function send_reliable(message) {
    driver.send_reliable(JSON.stringify(message));
  }
  function send_unreliable(message) {
    driver.send_unreliable(JSON.stringify(message));
  }
  const api = {
    driver,
    receive_ping(sts) {
    },
    receive_pong(sts, rts) {
    },
    receive_sync(id) {
    },
    receive_sync_all() {
    },
    receive_layout(id) {
    },
    receive_alert(title, body) {
    },
    receive_banner(text) {
    },
    receive_clear_banner() {
    },
    send_ping(sts) {
      send_reliable({
        _: "ping",
        sts
      });
    },
    send_pong(sts, rts) {
      send_reliable({
        _: "pong",
        sts,
        rts
      });
    },
    send_input_btn(id, is_down) {
      send_reliable({
        _: "input",
        id,
        d: is_down
      });
    },
    send_input_axis(id, value) {
      send_unreliable({
        _: "input",
        id,
        v: round(value)
      });
    },
    send_input_joy(id, x, y) {
      send_unreliable({
        _: "input",
        id,
        x: round(x),
        y: round(y)
      });
    },
    send_name(name) {
      send_reliable({
        _: "name",
        name
      });
    },
    send_session(sid) {
      send_reliable({
        _: "session",
        sid
      });
    },
    send_layout_ready(id) {
      send_reliable({
        _: "layout_ready",
        id
      });
    }
  };
  api.driver.on_message = (message) => {
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
        api.receive_ping(dict.sts);
        break;
      case "pong":
        api.receive_pong(dict.sts, dict.rts);
        break;
      case "sync":
        api.receive_sync(dict.id);
        break;
      case "sync_all":
        api.receive_sync_all();
        break;
      case "layout":
        api.receive_layout(dict.id);
        break;
      case "alert":
        api.receive_alert(dict.title, dict.body);
        break;
      case "banner":
        api.receive_banner(dict.text);
        break;
      case "clear_banner":
        api.receive_clear_banner();
        break;
      default:
        console.error("[JSON API] Unknown packet type: ", dict._);
        break;
    }
  };
  return api;
}
(async () => {
  var _a;
  const driver_type = "$_DRIVER_$";
  console.log("[Driver] ", driver_type);
  let create_driver = () => {
    throw new Error("Driver constructor not found.");
  };
  switch (driver_type) {
    case "WebSocket":
      create_driver = (await __vitePreload(() => import("./websocket_driver.js"), true ? [] : void 0)).default;
      break;
    case "WebRTC":
      create_driver = (await __vitePreload(() => import("./webrtc_driver.js"), true ? [] : void 0)).default;
      break;
    default:
      console.error("FAIL! [Driver] Unknown driver type: ", driver_type);
      return;
  }
  const driver = create_driver();
  const api = create_json_api(driver);
  const client = create_client(api);
  client.api.driver.on_status_change = () => {
    document.getElementById("menu-status").textContent = client.api.driver.get_status();
    render();
  };
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const menu_element = document.getElementById("menu");
  let is_menu_open = false;
  let width = 0;
  let height = 0;
  function transform_point(x, y) {
    x = x / UNIT_SIZE;
    y = y / UNIT_SIZE;
    return [x, y];
  }
  function scale_factor() {
    return window.devicePixelRatio * UNIT_SIZE;
  }
  setInterval(() => {
    if (!client.is_connected)
      return;
    if (client.ongoing_pings > 0)
      return;
    if (!client.is_connected)
      return;
    client.ping_server();
  }, PING_TIME);
  setInterval(() => {
    if (!client.is_connected)
      return;
    for (const control of controls) {
      if (control.sync)
        control.sync(false);
    }
  }, 1e3 / AUTO_SYNC_RATE);
  fill_canvas(canvas, () => {
    width = ctx.canvas.width / scale_factor();
    height = ctx.canvas.height / scale_factor();
    controls = [
      create_icon_button(client, () => {
        is_menu_open = true;
        update_menu();
      }, { center_x: 2, center_y: 2, icon: "menu" }),
      create_icon_button(client, () => {
      }, { center_x: width - 2, center_y: 2, icon: "pause" }),
      create_button(client, "a", { label: "A", center_x: width - 4, center_y: height - 9 }),
      create_button(client, "b", { label: "B", center_x: width - 9, center_y: height - 4 }),
      create_button(client, "x", { label: "X", center_x: width - 9, center_y: height - 4 - 10 }),
      create_button(client, "y", { label: "Y", center_x: width - 4 - 10, center_y: height - 9 }),
      create_joystick(client, "l", { label: "L", radius: 4, padding: 1, center_x: 8, center_y: height - 8 })
    ];
    render();
  });
  let controls = [];
  function render() {
    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.scale(scale_factor(), scale_factor());
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    for (const control of controls) {
      if (control.render) {
        ctx.save();
        control.render(ctx);
        ctx.restore();
      }
    }
    ctx.save();
    render_status();
    ctx.restore();
  }
  function render_status() {
    let text = client.api.driver.get_status();
    if (client.is_connected && client.ping_count > 0) {
      text = `${Math.round(client.last_ping)}ms (${Math.round(client.get_avg_ping())}ms)`;
      ctx.globalAlpha = 0.25;
    }
    ctx.font = "bold 1px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(text, width / 2, 1, width * 0.9);
  }
  function update_menu() {
    if (is_menu_open) {
      menu_element.classList.add("open");
      canvas.classList.add("open");
    } else {
      menu_element.classList.remove("open");
      canvas.classList.remove("open");
    }
  }
  function pointer_down(x, y, id) {
    if (is_menu_open)
      return;
    [x, y] = transform_point(x, y);
    for (const control of controls) {
      if (control.down)
        control.down(x, y, id);
    }
    for (const control of controls) {
      if (control.move)
        control.move(x, y, id);
    }
    render();
  }
  function pointer_move(x, y, id) {
    if (is_menu_open)
      return;
    [x, y] = transform_point(x, y);
    for (const control of controls) {
      if (control.move)
        control.move(x, y, id);
    }
    render();
  }
  function pointer_up(x, y, id) {
    if (is_menu_open)
      return;
    [x, y] = transform_point(x, y);
    for (const control of controls) {
      if (control.up)
        control.up(x, y, id);
    }
    render();
  }
  canvas.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    if (is_menu_open) {
      is_menu_open = false;
      update_menu();
    }
  });
  window.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    pointer_down(ev.x, ev.y, ev.pointerId);
  });
  window.addEventListener("pointerup", (ev) => {
    ev.preventDefault();
    pointer_up(ev.x, ev.y, ev.pointerId);
  });
  window.addEventListener("pointermove", (ev) => {
    ev.preventDefault();
    pointer_move(ev.x, ev.y, ev.pointerId);
  });
  canvas.addEventListener("touchstart", (ev) => ev.preventDefault());
  (_a = document.getElementById("menu-close")) == null ? void 0 : _a.addEventListener("click", (event) => {
    is_menu_open = false;
    update_menu();
  });
  client.connect(`ws://${location.hostname}:$_DRIVER_PORT_$`);
})();
