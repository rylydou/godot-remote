import ws_client from "./index3.js";
function rtc_driver(protocol, driver) {
  let peer_id;
  let peer = null;
  let reliable_channel = null;
  let unreliable_channel = null;
  let ice_ufrag = "";
  function update_connection_state() {
    var _a, _b, _c, _d;
    const was_connected = client.is_connected;
    client.is_connected = true;
    if ((peer == null ? void 0 : peer.connectionState) != "connected")
      client.is_connected = false;
    else if ((reliable_channel == null ? void 0 : reliable_channel.readyState) != "open")
      client.is_connected = false;
    else if ((unreliable_channel == null ? void 0 : unreliable_channel.readyState) != "open")
      client.is_connected = false;
    if (was_connected != client.is_connected) {
      (_a = client.on_status_change) == null ? void 0 : _a.call(client);
      if (client.is_connected)
        (_b = client.on_open) == null ? void 0 : _b.call(client);
      else
        (_c = client.on_close) == null ? void 0 : _c.call(client);
      (_d = client.on_status_change) == null ? void 0 : _d.call(client);
    }
  }
  protocol.on_ready = (_peer_id) => {
    peer_id = _peer_id;
    client.connect();
  };
  const client = {
    name: "RTC Client",
    is_connected: false,
    async connect() {
      console.log(`[RTC] Initializing #${peer_id}`);
      peer = new RTCPeerConnection({ iceServers: [{ "urls": ["stun:stun.l.google.com:19302"] }] });
      reliable_channel = peer.createDataChannel("reliable", { negotiated: true, id: 1 });
      reliable_channel.onopen = () => {
        console.log("[RTC] Reliable channel opened.");
        update_connection_state();
      };
      reliable_channel.onclose = () => {
        console.log("[RTC] Reliable channel closed.");
        update_connection_state();
      };
      reliable_channel.onerror = (ev) => console.log("[RTC] Reliable channel error: ", ev);
      reliable_channel.onmessage = (ev) => {
        var _a;
        console.log("[RTC] Reliable message:", ev.data);
        (_a = client.on_message) == null ? void 0 : _a.call(client, ev.data);
      };
      unreliable_channel = peer.createDataChannel("unreliable", { negotiated: true, id: 2, maxRetransmits: 0, ordered: false });
      unreliable_channel.onopen = () => {
        console.log("[RTC] Unreliable channel opened.");
        update_connection_state();
      };
      unreliable_channel.onclose = () => {
        console.log("[RTC] Unreliable channel closed.");
        update_connection_state();
      };
      unreliable_channel.onerror = (ev) => console.log("[RTC] Unreliable channel error: ", ev);
      unreliable_channel.onmessage = (ev) => {
        var _a;
        (_a = client.on_message) == null ? void 0 : _a.call(client, ev.data);
      };
      peer.onicecandidateerror = () => console.error("[RTC] Candidate error.");
      peer.onicecandidate = async (event) => {
        console.log("[RTC] Local candidate: ", event.candidate);
        if (event.candidate) {
          driver.send_reliable(protocol.candidate(event.candidate.sdpMid, event.candidate.sdpMLineIndex, event.candidate.candidate));
        } else {
          driver.send_reliable(protocol.candidate("", 0, ""));
        }
      };
      peer.onconnectionstatechange = (ev) => {
        console.log("[RTC] Peer:", peer.connectionState);
        update_connection_state();
      };
      protocol.on_description = (sdp, type) => {
        console.log(`[RTC] Received ${type}:`, sdp);
        const ufrag_start = sdp.indexOf("a=ice-ufrag:") + 12;
        const ufrag_end = sdp.indexOf("\r\n", ufrag_start);
        ice_ufrag = sdp.substring(ufrag_start, ufrag_end);
        console.log("[RTC] Ice ufrag:", ice_ufrag);
        const desc = new RTCSessionDescription({ sdp, type });
        peer.setRemoteDescription(desc);
      };
      protocol.on_candidate = async (media, index, name) => {
        await new Promise((resolve) => setTimeout(resolve, 2e3));
        console.log("[RTC] Received candidate:", { media, index, name });
        console.log("[RTC] Ice ufrag:", ice_ufrag);
        peer.addIceCandidate({
          candidate: media,
          sdpMLineIndex: index,
          usernameFragment: ice_ufrag
        });
      };
      console.log("[RTC] Creating offer.");
      const offer = await peer.createOffer();
      console.log(offer);
      console.log("[RTC] Setting local description to offer.");
      await peer.setLocalDescription(offer);
      console.log("[RTC] Sending offer.");
      driver.send_reliable(protocol.description(offer.sdp ?? "", offer.type));
    },
    async disconnect() {
      console.log("[RTC] Disconnecting.");
      reliable_channel == null ? void 0 : reliable_channel.close();
      unreliable_channel == null ? void 0 : unreliable_channel.close();
      peer == null ? void 0 : peer.close();
      reliable_channel = null;
      unreliable_channel = null;
      peer = null;
    },
    send_reliable(message) {
      reliable_channel == null ? void 0 : reliable_channel.send(message);
    },
    send_unreliable(message) {
      unreliable_channel == null ? void 0 : unreliable_channel.send(message);
    },
    get_status() {
      if (!peer)
        return "uninitialized";
      return `${peer.connectionState} ${reliable_channel == null ? void 0 : reliable_channel.readyState} ${unreliable_channel == null ? void 0 : unreliable_channel.readyState}`;
    }
  };
  return client;
}
function rtc_signal_protocol() {
  const protocol = {
    handle_message(message) {
      var _a, _b, _c;
      const dict = JSON.parse(message);
      if (!dict) {
        console.error("[RTC API] Cannot parse packet. The packet is not valid json.");
        return;
      }
      if (!dict._) {
        console.error("[RTC API] Cannot parse packet. The packet is missing and type and is therefore corrupt.");
        return;
      }
      switch (dict._) {
        case "ready":
          (_a = protocol.on_ready) == null ? void 0 : _a.call(protocol, dict.peer_id);
          break;
        case "description":
          (_b = protocol.on_description) == null ? void 0 : _b.call(protocol, dict.sdp, dict.type);
          break;
        case "candidate":
          (_c = protocol.on_candidate) == null ? void 0 : _c.call(protocol, dict.media, dict.index, dict.name);
          break;
        default:
          console.error("[RTC API] Unknown packet type: ", dict._);
          break;
      }
    },
    description: (sdp, type) => {
      return JSON.stringify({
        _: "description",
        type,
        sdp
      });
    },
    candidate: (media, index, name) => {
      return JSON.stringify({
        _: "candidate",
        media,
        index,
        name
      });
    }
  };
  return protocol;
}
function rtc_client() {
  const signaling_driver = ws_client();
  const signal_protocol = rtc_signal_protocol();
  signaling_driver.on_message = signal_protocol.handle_message;
  const rtc = rtc_driver(signal_protocol, signaling_driver);
  function update_state() {
    var _a, _b, _c;
    const was_connected = driver.is_connected;
    driver.is_connected = true;
    if (!signaling_driver.is_connected)
      driver.is_connected = false;
    if (!rtc.is_connected)
      driver.is_connected = false;
    if (was_connected != driver.is_connected) {
      if (driver.is_connected)
        (_a = driver.on_open) == null ? void 0 : _a.call(driver);
      else
        (_b = driver.on_close) == null ? void 0 : _b.call(driver);
      (_c = driver.on_status_change) == null ? void 0 : _c.call(driver);
    }
  }
  signaling_driver.on_status_change = update_state;
  rtc.on_status_change = update_state;
  const driver = {
    name: "RTC",
    is_connected: false,
    async connect() {
      signaling_driver.connect();
      rtc.on_message = driver.on_message;
    },
    async disconnect() {
      rtc.disconnect();
      signaling_driver.disconnect();
    },
    get_status() {
      return `WS:${signaling_driver.get_status()} RTC:${rtc.get_status()}`;
    },
    send_reliable(message) {
      rtc.send_reliable(message);
    },
    send_unreliable(message) {
      rtc.send_unreliable(message);
    }
  };
  return driver;
}
export {
  rtc_client as default
};
