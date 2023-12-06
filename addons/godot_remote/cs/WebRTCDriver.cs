using System.Collections.Generic;
using Godot;
using SIPSorcery.Net;
using Dict = Godot.Collections.Dictionary;
using Array = Godot.Collections.Array;

public partial class WebRTCDriver : RefCounted
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


	[Signal]
	public delegate void signaling_send_messageEventHandler(int peer_id, Variant message);

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

		peer.connection.onicecandidate += (candidate) =>
		{
			// peer.connection.addLocalIceCandidate(candidate);

			if (candidate is object)
			{
				GD.Print("Ice Candidate: ", candidate.candidate);
				_send_json(peer_id, new() {
				{"_", "candidate"},
				{"candidate", candidate.candidate},
			});
				return;
			}
			GD.Print("Last Ice Candidate");
			_send_json(peer_id, new() {
				{"_", "candidate"},
				{"candidate", ""},
			});
		};

		peer.connection.onicecandidateerror += (candidate, err) =>
		{
			GD.PrintErr("Ice Candidate Error: ", err, "\n", candidate);
		};

		peer.connection.onconnectionstatechange += (state) =>
		{
			GD.Print("Connection: ", state.ToString());
		};

		peer.connection.onsignalingstatechange += () =>
		{
			GD.Print("Signaling: ", peer.connection.signalingState.ToString());
		};

		peer.connection.onicegatheringstatechange += (state) =>
		{
			GD.Print("Ice Gather: ", state.ToString());
		};

		// -----

		peer.reliable_channel = await peer.connection.createDataChannel("reliable", new()
		{
			negotiated = true,
			id = 1,
		});

		if (peer.reliable_channel is not object)
		{
			GD.PrintErr("[WebRTC] Reliable channel creation failed!");
			return;
		}

		peer.reliable_channel.onopen += () =>
		{
			GD.Print("Reliable channel opened.");
		};
		peer.reliable_channel.onclose += () =>
		{
			GD.Print("Reliable channel closed.");
		};
		peer.reliable_channel.onmessage += (channel, protocol, data) =>
		{
			GD.Print("Reliable channel message: ", data.GetStringFromUtf8());
		};

		// peer.unreliable_channel = await peer.connection.createDataChannel("unreliable", new()
		// {
		// 	negotiated = true,
		// 	id = 1,
		// 	maxRetransmits = 0,
		// 	ordered = false,
		// });

		// if (peer.unreliable_channel is not object)
		// {
		// 	GD.PrintErr("[WebRTC] Unreliable channel creation failed!");
		// 	return;
		// }

		_send_json(peer_id, new Dict() {
			{"_", "ready"},
			{"peer_id", peer_id},
		});
	}


	public void signaling_peer_disconnected(int peer_id)
	{
		var peer = peers[peer_id];
		peers.Remove(peer_id);
		peer.connection.close();
	}

	public void signaling_description(int peer_id, string type, string sdp)
	{
		GD.Print("[RTC API] Description: type=", type, " sdp=", sdp);

		var peer = peers[peer_id];

		var int_type = type switch
		{
			"offer" => RTCSdpType.offer,
			"answer" => RTCSdpType.answer,
			"pranswer" => RTCSdpType.pranswer,
			"rollback" => RTCSdpType.rollback,
			_ => throw new System.Exception("Unknown description type."),
		};

		peer.connection.setRemoteDescription(new() { type = int_type, sdp = sdp });
	}

	public void signaling_candidate(int peer_id, string candidate)
	{
		GD.Print("[RTC API] Candidate: ", candidate);

		var peer = peers[peer_id];

		peer.connection.addIceCandidate(new()
		{
			candidate = candidate,
		});
	}


	public void send_reliable() { }


	public void send_unreliable() { }


	public void poll() { }
}
