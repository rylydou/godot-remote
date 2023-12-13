# WebSocket packets

## Types

| ID      | Name                                              | Javascript type      | Binary size |
| ------- | ------------------------------------------------- | -------------------- | ----------- |
| `bool`  | Boolean                                           | `boolean`            | `1` byte    |
| `byte`  | Unsigned 8-bit integer                            | `number`             | `1` byte    |
| `long`  | Unsigned 64-bit integer                           | `bigint`             | `8` bytes   |
| `float` | 32-bit IEEE float                                 | `number`             | `4` bytes   |
| `fixed` | `byte` mapped to -1/+1 in Binary, `float` in JSON | `number`             | `1` byte    |
| `str`   | UTF8 string                                       | `string`             | Varies      |
| `ref`   | `str` in JSON, `byte` in Binary                   | `string` or `number` | `1` byte    |


## Server to client packets

| Name         | JSON           | ID  | Arguments                                                    |
| ------------ | -------------- | --- | ------------------------------------------------------------ |
| Ping         | `ping`         | `1` | [Send timestamp `sts: long`]                                 |
| Pong         | `pong`         | ... | [Send timestamp `sts: long`] [Receive timestamp `rts: long`] |
| Force sync   | `sync`         | `2` | [Input ID: `id: ref`]                                        |
| Sync all     | `sync_all`     | ... |                                                              |
| Set layout   | `layout`       | `3` | [Layout: `id: ref`]                                          |
| Alert        | `alert`        | `4` | [Title `title: str`] [Body `body: str`]                      |
| Banner       | `banner`       | `5` | [Text `txt: str`]                                            |
| Clear banner | `clear_banner` | ... |                                                              |

> 1. `ping` expects a response from the client via a `pong` packet. The `sts` is mirrored which serves as a identifier for the server.


## Client to server packets

| Name           | JSON           | ID  | Arguments                                                    |
| -------------- | -------------- | --- | ------------------------------------------------------------ |
| Ping           | `ping`         | `1` | [Send timestamp `sts: long`]                                 |
| Pong           | `pong`         | ... | [Send timestamp `sts: long`] [Receive timestamp `rts: long`] |
| Input          | `input`        | `2` | [Input ID `id: ref`] _+ Any additional arguments..._         |
| Set name       | `name`         | `3` | [New name `name: str`]                                       |
| Session        | `session`      | `4` | [Session ID `sid: long`]                                     |
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
