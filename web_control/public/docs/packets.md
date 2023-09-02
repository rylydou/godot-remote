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

| Packet ID | Name         | JSON ID  | Arguments                               |
| --------- | ------------ | -------- | --------------------------------------- |
| `1`       | Ping         | `ping`   | [Send timestamp `sts: long`]            |
| `2`       | Force sync   | `sync`   | [Input ID: `id: ref`]                   |
| `2`       | Sync all     | `sync`   |                                         |
| `3`       | Set layout   | `layout` | [Layout: `id: ref`]                     |
| `4`       | Kick         | `kick`   | [Reason `reason: str`]                  |
| `5`       | Alert        | `alert`  | [Title `title: str`] [Body `body: str`] |
| `6`       | Banner       | `banner` | [Text `txt: str`]                       |
| `6`       | Clear banner | `banner` |                                         |

> 1. `ping` expects a response from the client via a `pong` packet. The `sts` is mirrored which serves as a identifier for the server.

## Client to server packets

| Packet ID | Name           | JSON ID        | Arguments                                                     | Transfer mode |
| --------- | -------------- | -------------- | ------------------------------------------------------------- | ------------- |
| `1`       | Pong           | `pong`         | [Send timestamp `sts: long`] [Received timestamp `rts: long`] | Reliable      |
| `2`       | Input          | `input`        | [ID `id: ref`] _+ Any additional arguments..._                | Depends...    |
| `3`       | Set name       | `name`         | [Name `name: str`]                                            | Reliable      |
| `4`       | Layout changed | `layout_ready` | [Layout `id: ref`]                                            | Reliable      |
| `5`       | Session        | `session`      | [Session ID `sid: long`]                                      | Reliable      |

> 1. `pong` is in response to a server's `ping` packet. The `sts` is mirrored which serves as a identifier for the server.

### Inputs

| Input name        | Additional arguments                    | Transfer mode |
| ----------------- | --------------------------------------- | ------------- |
| Button            | [Is down `d: bool`]                     | Reliable      |
| Axis position     | [Value `v: fixed`]                      | Unreliable    |
| Axis Zero         |                                         | Unreliable    |
| Joystick position | [X-axis `x: fixed`] [Y-axis `y: fixed`] | Unreliable    |
| Joystick zero     |                                         | Unreliable    |

> - Up is negative on the y-axis.
> - `axis` and `joy` values have a range of `-1` (inclusive) to `+1` (inclusive)
