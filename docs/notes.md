# Notes

1. Anything relating to json is meant to be somewhat verbose to aid with debugging. _(Different JSON IDs for `ping` and `pong` while binary uses the same ID.)_
2. `axis` and `joy` inputs send a specific packet when released to allow for the server to interpret it as pressing in on the stick. _(If the control not moved too from `0` and released it's safe to assume the control was tapped)_


## Future plans

- Look into using WebRTC but the caveat is that a extension needs to be installed in Godot for it to work. WebRTC also seams a little overkill for what I need.
- Look into using WebTransport and WebStreams API instead of WebSockets once Safari support becomes better. [Can I use?](https://caniuse.com/mdn-api_webtransport)


## Intended strange behaviors and justifications

**Scenario**: A client a connects but it's session id is already being actively used by another client.

**Result**: The new client takes over the controller and the previous client get kicked and the websocket connection is closed.

**Justification**: The previous client may have been bugged which caused the user to open a new connection. The old client should be ignored.
