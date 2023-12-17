# 🖥️ Sever to Client

| Packet Type ID | Arguments                               |
| -------------- | --------------------------------------- |
| `ping`         | [Timestamp `t: uint`]                   |
| `pong`         | [Timestamp `t: uint`]                   |
| `sync`         | [`id: ref`]                             |
| `sync_all`     |                                         |
| `layout`       | [Layout: `id: ref`]                     |
| `alert`        | [Title `title: str`] [Body `body: str`] |
| `banner`       | [Text `txt: str`]                       |
| `clear_banner` |                                         |


# 📱 Client to Server

| Packet Type ID | Arguments                                                               |
| -------------- | ----------------------------------------------------------------------- |
| `input`        | [Input ID `id: ref`] [Time `t: ushort`] _+ Any additional arguments..._ |
| `ping`         | [Timestamp `t: uint`]                                                   |
| `pong`         | [Timestamp `t: uint`]                                                   |
| `session`      | [Session ID `sid: uint`]                                                |
| `layout_ready` | [Layout ID `id: ref`]                                                   |
| `name`         | [New name `name: str`]                                                  |


## 📱🕹️ Input packets

| Type  | Description               | Additional arguments                           |
| ----- | ------------------------- | ---------------------------------------------- |
| `btn` | Button pressed/released   | [Is down? `d: bool`]                           |
| `joy` | Joystick move             | [`x: fixed`] [`y: fixed`]                      |
| `joy` | Joystick pressed/released | [Is down? `d: bool`] [`x: fixed`] [`y: fixed`] |
