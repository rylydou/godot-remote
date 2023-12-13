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
const AUTO_SYNC_RATE = 20;
const PING_TIME = 3e3;
const UNIT_SIZE = 16;
const SESSION_STORAGE_KEY = "gremote:session_id";
async function create_remote() {
  let client_type = "$_CLIENT_$";
  let protocol_type = "$_PROTOCOL_$";
  console.log(client_type);
  if (client_type.startsWith("$")) {
    client_type = "RTC";
    console.warn(`No client defined! Assuming ${client_type} which may not be correct.`);
  }
  if (protocol_type.startsWith("$")) {
    protocol_type = "JSON";
    console.warn(`No protocol defined! Assuming ${protocol_type} which may not be correct.`);
  }
  console.log("Driver:", client_type);
  console.log("Protocol:", protocol_type);
  let create_client = () => {
    throw new Error("Client constructor not found.");
  };
  let create_protocol = () => {
    throw new Error("Protocol constructor not found.");
  };
  switch (client_type) {
    case "WS":
      create_client = (await __vitePreload(() => import("./index3.js"), true ? [] : void 0)).default;
      break;
    case "RTC":
      create_client = (await __vitePreload(() => import("./index2.js"), true ? ["index2.js","index3.js"] : void 0)).default;
      break;
  }
  switch (protocol_type) {
    case "JSON":
      create_protocol = (await __vitePreload(() => import("./json.js"), true ? [] : void 0)).default;
      break;
  }
  const driver = create_client();
  const protocol = create_protocol();
  driver.on_message = protocol.handle_message;
  protocol.on_ping = (sts) => {
    driver.send_reliable(client.protocol.pong(sts, Date.now()));
  };
  protocol.on_pong = (sts, rts) => {
    var _a;
    const now = Date.now();
    const ping = now - sts;
    client.ongoing_pings--;
    client.ping = ping;
    client.pong_timestamp = now;
    (_a = client.on_status_change) == null ? void 0 : _a.call(client);
  };
  driver.on_open = () => {
    console.log("[Client] Connected.");
    client.ongoing_pings = 0;
    client.ping = 0;
    client.pong_timestamp = 0;
    client.driver.send_reliable(client.protocol.session(client.session_id));
  };
  driver.on_close = () => {
    setTimeout(() => {
      if (client.auto_reconnect) {
        console.log("[Client] Auto reconnecting due to disconnect.");
        client.driver.connect();
      }
    }, 5e3);
  };
  setInterval(() => {
    if (!driver.is_connected)
      return;
    if (client.ongoing_pings > 0)
      return;
    client.ping_server();
  }, PING_TIME);
  const new_session_id = Math.floor(Math.random() * 899999) + 1e5;
  const session_id = Number(sessionStorage.getItem(SESSION_STORAGE_KEY) || new_session_id);
  sessionStorage.setItem(SESSION_STORAGE_KEY, session_id.toString());
  document.getElementById("menu_session_id").textContent = "#" + session_id;
  const client = {
    protocol,
    driver,
    auto_reconnect: false,
    // is_connected: false,
    status: "Connecting...",
    session_id,
    ongoing_pings: 0,
    pong_timestamp: 0,
    ping: 0,
    ping_server() {
      client.ongoing_pings++;
      client.protocol.ping(Date.now());
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
function create_button(remote, id, options) {
  const label = (options == null ? void 0 : options.label) || "";
  const center_x = (options == null ? void 0 : options.center_x) || 0;
  const center_y = (options == null ? void 0 : options.center_y) || 0;
  const radius = (options == null ? void 0 : options.radius) || 3;
  const outline_thickness = 0.5;
  let pointer_id = 0;
  let is_active = false;
  let synced_active = false;
  const button = {
    remote,
    sync(forced) {
      if (!remote.driver.is_connected)
        return;
      if (!forced) {
        if (synced_active == is_active)
          return;
      }
      synced_active = is_active;
      remote.driver.send_reliable(remote.protocol.input_btn(id, synced_active));
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
function create_joystick(remote, id, options) {
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
    remote,
    sync(forced) {
      if (!remote.driver.is_connected)
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
      remote.driver.send_unreliable(remote.protocol.input_joy(id, synced_x, synced_y));
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
      ctx.beginPath();
      ctx.ellipse(synced_x * radius, synced_y * radius, handle_radius * 0.5, handle_radius * 0.5, 0, 0, 7);
      ctx.save();
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.restore();
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
    remote: client,
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
(async () => {
  var _a;
  const remote = await create_remote();
  remote.driver.on_status_change = render;
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
    if (!remote.driver.is_connected)
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
      create_icon_button(remote, () => {
        is_menu_open = true;
        update_menu();
      }, { center_x: 2, center_y: 2, icon: "menu" }),
      create_icon_button(remote, () => {
      }, { center_x: width - 2, center_y: 2, icon: "pause" }),
      create_button(remote, "a", { label: "A", center_x: width - 4, center_y: height - 9 }),
      create_button(remote, "b", { label: "B", center_x: width - 9, center_y: height - 4 }),
      create_button(remote, "x", { label: "X", center_x: width - 9, center_y: height - 4 - 10 }),
      create_button(remote, "y", { label: "Y", center_x: width - 4 - 10, center_y: height - 9 }),
      create_joystick(remote, "l", { label: "L", radius: 4, padding: 1, center_x: 8, center_y: height - 8 })
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
    let text = "null";
    if (remote.driver.is_connected && remote.ping > 0) {
      text = `${remote.driver.name}: ${Math.round(remote.ping)}ms`;
      ctx.globalAlpha = 0.25;
    } else {
      text = `${remote.driver.name}: ${remote.driver.get_status()}`;
    }
    ctx.font = "bold 1px monospace";
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
  remote.driver.connect();
})();
