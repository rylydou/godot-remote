using System.Collections.Generic;
using Godot;
using SIPSorcery.Net;
using Dict = Godot.Collections.Dictionary;
using Array = Godot.Collections.Array;
using System.Net;
using System;


public partial class InternalSIPDriver : RefCounted
{
	class Peer
	{
		public RTCPeerConnection connection;
		public RTCDataChannel reliable_channel;
		public RTCDataChannel unreliable_channel;
	}


	[Export]
	public Array ice_servers = new() {
		new Dict() {
			{"url", "stun.l.google.com:19302"},
		},
		// new Dict() {
		// 	{"url", "stun1.l.google.com:19302"},
		// },
		// new Dict() {
		// 	{"url", "stun2.l.google.com:19302"},
		// },
		// new Dict() {
		// 	{"url", "stun3.l.google.com:19302"},
		// },
		// new Dict() {
		// 	{"url", "stun4.l.google.com:19302"},
		// }
	};


	readonly Dictionary<int, Peer> peers = new();


	[Signal] public delegate void signaling_send_messageEventHandler(int peer_id, Variant message);

	[Signal] public delegate void message_receivedEventHandler(int peer_id, Variant message);

	[Signal] public delegate void client_connectedEventHandler(int peer_id);
	[Signal] public delegate void client_disconnectedEventHandler(int peer_id);

	void _send_json(int peer_id, Dict message)
	{
		GD.Print(Json.Stringify(message));
		EmitSignal(SignalName.signaling_send_message, peer_id, Json.Stringify(message));
	}


	public async void signaling_peer_connected(int peer_id)
	{
		var peer = new Peer();
		peers.Add(peer_id, peer);


		// Parse ICE Server config
		var rtc_ice_servers = new List<RTCIceServer>();
		foreach (Dict ice_server in ice_servers)
		{
			var url = (string)ice_server["url"];
			var rtc_ice_server = new RTCIceServer { urls = url, };

			Variant username_variant;
			Variant credential_variant;
			if (ice_server.TryGetValue("username", out username_variant) && ice_server.TryGetValue("credential", out credential_variant))
			{
				string username = username_variant.AsString();
				string credential = credential_variant.AsString();

				rtc_ice_server.credentialType = RTCIceCredentialType.password;
				rtc_ice_server.username = username;
				rtc_ice_server.credential = credential;
			}

			rtc_ice_servers.Add(rtc_ice_server);
		}
		var config = new RTCConfiguration() { iceServers = rtc_ice_servers, };

		// Create a new peer with the config
		peer.connection = new RTCPeerConnection(config);

		peer.connection.GetRtpChannel().MdnsResolve += async (address) =>
		{
			var addresses = await Dns.GetHostAddressesAsync(address);
			foreach (var addr in addresses)
			{
				GD.Print("[SIP] Resolved address: ", addr.ToString());
			}
			return addresses[0];
		};

		peer.connection.onicecandidate += (candidate) =>
		{
			// peer.connection.addLocalIceCandidate(candidate);

			if (candidate is object)
			{
				GD.Print("[SIP] Generated Ice Candidate: mid=", candidate.sdpMid, " index=", candidate.sdpMLineIndex, " candidate=", candidate.candidate);
				_send_json(peer_id, new() {
				{ "_",         "candidate" },
				{ "candidate", "candidate:"+candidate.candidate },
				{ "sdp_mid",   candidate.sdpMid },
				{ "sdp_index", candidate.sdpMLineIndex },
				{ "ufrag",     candidate.usernameFragment },
			});
				return;
			}
			GD.Print("[SIP] Generated Empty Candidate");
			_send_json(peer_id, new() {
				{ "_",         "candidate" },
				{ "candidate", "" },
				{ "sdp_mid",   "" },
				{ "sdp_index", 0 },
				{ "ufrag",     "" },
			});
		};

		peer.connection.onicecandidateerror += (candidate, err) =>
		{
			GD.PrintErr("[SIP] Candidate Error: ", err, "\n", candidate);
		};

		peer.connection.onconnectionstatechange += (state) =>
		{
			GD.Print("[SIP] Change in Connection: ", state.ToString());
			// switch (state)
			// {
			// 	case RTCPeerConnectionState.connected:
			// 		break;
			// 	case RTCPeerConnectionState.disconnected:
			// 		break;
			// }
		};

		peer.connection.onsignalingstatechange += () =>
		{
			GD.Print("[SIP] Change in Signaling: ", peer.connection.signalingState.ToString());
		};

		peer.connection.onicegatheringstatechange += (state) =>
		{
			GD.Print("[SIP] Change in Gather: ", state.ToString());
		};

		// -----

		peer.reliable_channel = await peer.connection.createDataChannel("reliable", new()
		{
			negotiated = true,
			id = 1,
		});

		if (peer.reliable_channel is not object)
		{
			GD.PrintErr("[SIP] Reliable Failed to initialize.");
			return;
		}

		peer.reliable_channel.onopen += () =>
		{
			GD.Print("[SIP] Reliable Opened.");
			EmitSignal(SignalName.client_connected, peer_id);

			// _send_json(peer_id, new Dict() {
			// 	{"_", "ready"},
			// 	{"peer_id", peer_id},
			// });
		};
		peer.reliable_channel.onclose += () =>
		{
			GD.Print("[SIP] Reliable Closed.");
			EmitSignal(SignalName.client_disconnected, peer_id);
		};
		peer.reliable_channel.onmessage += (channel, protocol, data) =>
		{
			// GD.Print("[SIP] Reliable Message: ", data.GetStringFromUtf8());
			EmitSignal(SignalName.message_received, peer_id, data);
		};

		peer.unreliable_channel = await peer.connection.createDataChannel("unreliable", new()
		{
			negotiated = true,
			id = 2,
			maxRetransmits = 0,
			ordered = false,
		});

		if (peer.unreliable_channel is not object)
		{
			GD.PrintErr("[WebRTC] Unreliable channel creation failed!");
			return;
		}

		peer.unreliable_channel.onopen += () =>
		{
			GD.Print("[SIP] Unreliable Opened.");
		};
		peer.unreliable_channel.onclose += () =>
		{
			GD.Print("[SIP] Unreliable Closed.");
		};
		peer.unreliable_channel.onmessage += (channel, protocol, data) =>
		{
			// GD.Print("[SIP] Unreliable Message: ", data.GetStringFromUtf8());
			EmitSignal(SignalName.message_received, peer_id, data);
		};
	}


	public void signaling_peer_disconnected(int peer_id)
	{
		var peer = peers[peer_id];
		peers.Remove(peer_id);

		peer.reliable_channel.close();
		peer.unreliable_channel.close();
		peer.connection.close();
	}


	public void signaling_description(int peer_id, string type, string sdp)
	{
		GD.Print("[SIP] Received Description: type=", type, " sdp=", sdp);

		var peer = peers[peer_id];

		var int_type = type switch
		{
			"offer" => RTCSdpType.offer,
			"answer" => RTCSdpType.answer,
			"pranswer" => RTCSdpType.pranswer,
			"rollback" => RTCSdpType.rollback,
			_ => throw new System.Exception("Unknown description type."),
		};

		var err = peer.connection.setRemoteDescription(new() { type = int_type, sdp = sdp });
		GD.Print("[SIP] setRemoteDescription: ", err.ToString());


		var answer = peer.connection.createAnswer();
		GD.Print("[SIP] Created Answer: type=", answer.type, " sdp=", answer.sdp);
		_send_json(peer_id, new() {
			{ "_", "description" },
			{ "type", answer.type.ToString() },
			{ "sdp", answer.sdp },
		});
	}


	public void signaling_candidate(int peer_id, string candidate, string sdp_mid, ushort spd_index, string ufrag)
	{
		GD.Print("[SIP] Received Candidate: mid=", sdp_mid, " index=", sdp_mid, " candidate=", candidate);

		var peer = peers[peer_id];

		peer.connection.addIceCandidate(new()
		{
			candidate = candidate,
			sdpMid = sdp_mid,
			sdpMLineIndex = spd_index,
			usernameFragment = ufrag,
		});
	}


	Error send_channel(RTCDataChannel channel, Variant message)
	{
		if (channel.readyState != RTCDataChannelState.open)
		{
			GD.PrintErr("[SIP] Channel is not open.");
			return Error.ConnectionError;
		}

		switch (message.VariantType)
		{
			case Variant.Type.String:
				channel.send(message.AsString());
				return Error.Ok;
			case Variant.Type.PackedByteArray:
				channel.send(message.AsByteArray());
				return Error.Ok;
			default:
				GD.PushWarning("[SIP] Converting message to bytes.");
				channel.send(GD.VarToBytes(message));
				return Error.Ok;
		}
	}


	public Error send_reliable(int peer_id, Variant message)
	{
		var peer = peers[peer_id];
		return send_channel(peer.reliable_channel, message);
	}


	public Error send_unreliable(int peer_id, Variant message)
	{
		var peer = peers[peer_id];
		return send_channel(peer.unreliable_channel, message);
	}


	public void disconnect_peer(int peer_id, string reason = "")
	{
		var peer = peers[peer_id];
		peers.Remove(peer_id);

		peer.reliable_channel.close();
		peer.unreliable_channel.close();
		peer.connection.close();
	}


	public void poll() { }
}
