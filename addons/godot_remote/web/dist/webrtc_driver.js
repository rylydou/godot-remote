function create_driver() {
  let peer = null;
  let reliable_channel = null;
  let unreliable_channel = null;
  let peer_id;
  const driver = {
    async connect(address) {
      console.log("[WebRTC] Connecting to ", address);
      peer = new RTCPeerConnection({ iceServers: [{ "urls": ["stun:stun.l.google.com:19302"], username: "Billy" }] });
      peer.onconnectionstatechange = () => {
        if (driver.on_status_change)
          driver.on_status_change();
      };
      peer.oniceconnectionstatechange = () => {
        if (driver.on_status_change)
          driver.on_status_change();
      };
      peer.onicegatheringstatechange = () => {
        if (driver.on_status_change)
          driver.on_status_change();
      };
      peer.onsignalingstatechange = () => {
        if (driver.on_status_change)
          driver.on_status_change();
      };
      peer.onnegotiationneeded = () => {
        console.log("Negotiation needed.");
      };
      peer.onicecandidateerror = () => {
        console.error("Ice candidate error.");
      };
      peer.onicecandidate = async (event) => {
        await new Promise((r) => setTimeout(r, 3e3));
        console.log("[WebRTC] My candidate: ", event.candidate);
        if (!peer_id) {
          console.log("[WebRTC] peer_id is undefined. Returning");
          return;
        }
        const ice_response = await fetch("/webrtc/ice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            peer_id,
            candidate: event.candidate
          })
        });
        if (!ice_response.ok)
          return;
        const answer2 = await ice_response.json();
        console.log("[WebRTC] Ice response: ", answer2);
      };
      console.log("[WebRTC] Creating data channels.");
      reliable_channel = peer.createDataChannel("reliable", { negotiated: true, id: 1 });
      reliable_channel.onopen = () => console.log("[WebRTC] Reliable channel opened.");
      reliable_channel.onclose = () => console.log("[WebRTC] Reliable channel closed.");
      reliable_channel.onerror = (ev) => console.log("[WebRTC] Reliable channel error: ", ev);
      unreliable_channel = peer.createDataChannel("unreliable", { negotiated: true, id: 2, maxRetransmits: 0, ordered: false });
      unreliable_channel.onopen = () => console.log("[WebRTC] Unreliable channel opened.");
      unreliable_channel.onclose = () => console.log("[WebRTC] Unreliable channel closed.");
      unreliable_channel.onerror = (ev) => console.log("[WebRTC] Unreliable channel error: ", ev);
      console.log("[WebRTC] Creating offer.");
      const local_offer = await peer.createOffer();
      console.log("[WebRTC] Setting local description to offer.");
      await peer.setLocalDescription(local_offer);
      console.log("[WebRTC] Sending offer and awaiting answer.");
      const answer_response = await fetch("/webrtc/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(local_offer)
      });
      if (!answer_response.ok)
        return;
      const answer = await answer_response.json();
      peer_id = answer.peer_id;
      console.log("answer peer id: ", peer_id);
      console.log("[WebRTC] Setting remote description to answer.");
      await peer.setRemoteDescription({ type: answer.type, sdp: answer.sdp });
    },
    async disconnect() {
      console.log("[WebRTC] Disconnecting.");
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
      return `peer(${peer.connectionState} ${peer.signalingState}) ice(${peer.iceConnectionState} gather:${peer.iceGatheringState})`;
    }
  };
  return driver;
}
export {
  create_driver as default
};
