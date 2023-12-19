# Godot Remote

Use your phone as a wireless gamepad in Godot. Similar to [jackbox.tv](https://jackbox.tv) but more realtime.

> [!CAUTION]
> **The project is under very active development** and is missing many important features. It's changing everyday so there isn't even the roughest of roadmaps.
> 
> Also note the following:
> - Horrible and even misleading documentation.
> - No real world testing... _I will get to that later._
> - Lack of vital security measures. **⟵ _( !!! )_**


## Setup for Games

> [!NOTE]
> The following may be out of date.

- Install a mono version of Godot `4.2.X` (tested on `4.2.1`).


### Additional Setup for Development

- The repository already contains compiled code for the web interface. If you want to develop for it then follow these steps.
  - Open a terminal in `addons/godot_remote/web`.
  - Run `pnpm i` to install dependencies. [Don't have PNPM?](https://pnpm.io)
  - Run `pnpm run watch` to watch and compile code.

> [!TIP]
> Check out [`/docs`](docs/) for more info on development! _(may be out of date)_


## Configuration

- Open `addons/godot_remote/scenes/autoloads/remote.tscn`
- Define desired driver and api scripts
  - At the moment only 3 drivers exist: WebSocket, WebRTC*, and SIP. You can find them in `addons/godot_remote/scripts/drivers/`.


## Drivers

### WebSocket

- Script: `websocket_driver.gd`
- Status: _Perfect but slow_

The most reliable but slowest of all the drivers. Everything should work perfectly when using this driver but ping is way to high for realtime games.


### WebRTC

- Script: `webrtc_driver.gd` (Uses the [webrtc-native](https://github.com/godotengine/webrtc-native) GDNative addon)
- Status: _Not implemented_

Currently this driver has not be implemented yet. At the moment I am having trouble getting it to work and I'm waiting on [this issue for more info](https://github.com/godotengine/webrtc-native/issues/128).

[WebRTC](https://en.wikipedia.org/wiki/WebRTC) is an overkill communication standard however it is the only widely supported way to quickly send data over the internet (see [Why WebRTC?](#why-webrtc)). Under the hood the driver uses the [WebSocket](#websocket) driver to establish it's connection, _pretty cool right?_


### SIP Sorcery

- Script: `sip_driver.gd` (uses C# and the `SIPSorcery` .NET package)
- Status: _It works but needs some work_

[See WebRTC](#webrtc)


## Footnotes

### Why WebRTC?

There are two kinds of fundamental types of [internet transport protocols](https://en.wikipedia.org/wiki/Internet_protocol_suite#Transport_layer): [TCP](https://en.wikipedia.org/wiki/Transmission_Control_Protocol) and [UDP](https://en.wikipedia.org/wiki/User_Datagram_Protocol). You can count on [TCP](https://en.wikipedia.org/wiki/Transmission_Control_Protocol) packets (little messages) being sent to their destination but that reliability comes at a cost. On the opposite side of the coin there is [UDP](https://en.wikipedia.org/wiki/User_Datagram_Protocol) which is very fast but that comes at the cost of reliability. You won't even know if your messages have been delivered! The downsides of UDP are almost irrelevant for the project because the controller in always sending information about the controler plus we can choose which of the two protocols we want to use, playing into each others' strengths and weaknesses.

Unfortunately web browsers are really restrictive about what kinds of protocols they will let us use. The only two ways to send UDP (or UDP like) packets is either with [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API#webrtc_reference) or [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport), [the latter of which is lacking support](https://caniuse.com/webtransport) in Safari, [a big deal for phones](https://news.ycombinator.com/item?id=25850091).


## Credits
- [kenyoni-software/godot-addons/qr-code](https://github.com/kenyoni-software/godot-addons#qr-code) (MIT)
- [deep-entertainment/godottpd](https://github.com/deep-entertainment/godottpd) (MIT)
