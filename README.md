# Godot Remote

Use your phone as a wireless gamepad in Godot.


## Setup for Games

- The binaries for WebRTC are not inclueded in the repository because they are too large and therefore need to be installed separately. This can be done by going into the AssetLib in godot and downloading `WebRTC plugin - Godot 4.1+`. Install the `lib` directory into `res://` (directly into the root), everything else can be excluded. **Restarting Godot may be necessary.**


### Additional Setup for Development

- The repository already contains compiled code for the web interface but if you want to develop for the web interface then follow these steps.
  - Open a terminal in `addons/godot_remote/web`.
  - Run `pnpm i` to install dependencies.
  - Run `pnpm run watch` to watch and compile code.

[Check out the markdown docs for more info!](docs/)


## Configuration

- Open `addons/godot_remote/scenes/autoloads/remote.tscn`
- Define desired driver and api scripts
  - At the moment only 2 drivers exist: WebSocket and WebRTC. You can find them in `addons/godot_remote/scripts/drivers/`.
