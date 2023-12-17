# Packets

## Types

| ID       | Name                                              | Javascript type      | Binary size |
| -------- | ------------------------------------------------- | -------------------- | ----------- |
| `bool`   | Boolean                                           | `boolean`            | `1` byte    |
| `byte`   | Unsigned 8-bit integer                            | `number`             | `1` byte    |
| `ushort` | Unsigned 16-bit integer                           | `number`             | `8` bytes   |
| `uint`   | Unsigned 32-bit integer                           | `number`             | `8` bytes   |
| `float`  | 32-bit IEEE float                                 | `number`             | `4` bytes   |
| `fixed`  | `byte` mapped to -1/+1 in Binary, `float` in JSON | `number`             | `1` byte    |
| `str`    | UTF8 string                                       | `string`             | Varies      |
| `ref`    | `str` in JSON, `byte` in Binary                   | `string` or `number` | `1` byte    |


## Server to Client Packets

| Name         | JSON           | Arguments                               |
| ------------ | -------------- | --------------------------------------- |
| Ping         | `ping`         | [Timestamp `sts: uint`]                 |
| Pong         | `pong`         | [Timestamp `sts: uint`]                 |
| Force sync   | `sync`         | [Input ID: `id: ref`]                   |
| Sync all     | `sync_all`     |                                         |
| Set layout   | `layout`       | [Layout: `id: ref`]                     |
| Alert        | `alert`        | [Title `title: str`] [Body `body: str`] |
| Banner       | `banner`       | [Text `txt: str`]                       |
| Clear banner | `clear_banner` |                                         |

> 1. `ping` expects a response from the client via a `pong` packet. The `sts` is mirrored which serves as a identifier for the server.


## Client to Server Packets

| Name           | JSON           | ID  | Arguments                                                    |
| -------------- | -------------- | --- | ------------------------------------------------------------ |
| Misc           | `input`        | `0` | [Input ID `id: ref`] _+ Any additional arguments..._         |
| Ping           | `ping`         | `1` | [Send timestamp `sts: uint`]                                 |
| Pong           | `pong`         | ... | [Send timestamp `sts: uint`] [Receive timestamp `rts: uint`] |
| Input          | `input`        | `2` | [Input ID `id: ref`] _+ Any additional arguments..._         |
| Set name       | `name`         | `3` | [New name `name: str`]                                       |
| Session        | `session`      | `4` | [Session ID `sid: uint`]                                     |
| Layout changed | `layout_ready` | `5` | [Layout ID `id: ref`]                                        |

> 1. `pong` is in response to a server's `ping` packet. The `sts` is mirrored which serves as a identifier for the server.


### Inputs

| Type      | Description      | Additional arguments                    | Transfer mode |
| --------- | ---------------- | --------------------------------------- | ------------- |
| `btn`     | State change     | [Is down `d: bool`]                     | Reliable      |
| `axis`    | Value change     | [Value `v: fixed`]                      | Unreliable    |
| ...`zero` | Release and zero |                                         | Reliable      |
| `joy`     | Position change  | [X-axis `x: fixed`] [Y-axis `y: fixed`] | Unreliable    |
| ...`zero` | Release and zero |                                         | Reliable      |

> - Up is negative on the y-axis.
> - `axis` and `joy` values have a range of `-1` (inclusive) to `+1` (inclusive).
