# WebSocket packets

## Types

| ID      | Name                                                       | Javascript type      | Binary size |
| ------- | ---------------------------------------------------------- | -------------------- | ----------- |
| `bool`  | Boolean                                                    | `boolean`            | `8` bits    |
| `byte`  | Unsigned 8-bit integer                                     | `number`             | `8` bits    |
| `long`  | Unsigned 64-bit integer                                    | `bigint`             | `64` bits   |
| `float` | 32-bit IEEE float                                          | `number`             | `32` bits   |
| `fixed` | A decimal from -1 to +1 in Binary, same as `float` in JSON | `number`             | `8` bits    |
| `str`   | UTF8 string                                                | `string`             | Varies      |
| `ref`   | `str` in JSON, `byte` in Binary                            | `string` or `number` | `8` bits    |

## Server to client packets 

| Packet ID | Name       | JSON ID  | Arguments                               |
| --------- | ---------- | -------- | --------------------------------------- |
| `1`       | Ping       | `ping`   | [Send timestamp `sts: long`]            |
| `2`       | Force sync | `sync`   |                                         |
| `3`       | Set layout | `layout` | [Layout: `id: ref`]                     |
| `4`       | Kick       | `kick`   | [Reason `reason: str`]                  |
| `5`       | Alert      | `alert`  | [Title `title: str`] [Body `body: str`] |
| `6`       | Banner     | `banner` | [Text `txt: str`]                       |

## Client to server packets

| Packet ID | Name           | JSON ID        | Arguments                                                     | Transfer mode |
| --------- | -------------- | -------------- | ------------------------------------------------------------- | ------------- |
| `1`       | Pong           | `pong`         | [Send timestamp `sts: long`] [Received timestamp `rts: long`] | Reliable      |
| `2`       | Input          | `input`        | [ID: `id: ref`] _+ Any additional arguments..._               | Depends...    |
| `3`       | Set name       | `name`         | [Name `name: str`]                                            | Reliable      |
| `4`       | Layout changed | `layout_ready` | [Layout `id: ref`]                                            | Reliable      |

### Inputs

| Input name        | Additional arguments                    | Transfer mode |
| ----------------- | --------------------------------------- | ------------- |
| Button            | [Is down `d: bool`]                     | Reliable      |
| Axis position     | [Value `v: fixed`]                      | Unreliable    |
| Axis Zero         |                                         | Unreliable    |
| Joystick position | [X-axis `x: fixed`] [Y-axis `y: fixed`] | Unreliable    |
| Joystick zero     |                                         | Unreliable    |

#### Other notes
- Up/north is negative on the y-axis.
- `axis` and `joy` values have a range of `-1` (inclusive) to `+1` (inclusive)

# Built-in controller layouts

## Classic NES

The NES controller with an analog joystick on the left instead of a d-pad.

- ID: `1`
- JSON ID: `nes`

| ID  | Input Name    | JSON ID  | Input type |
| --- | ------------- | -------- | ---------- |
| `1` | Start button  | `start`  | `btn`      |
| `2` | Select button | `select` | `btn`      |
| `3` | A button      | `a`      | `btn`      |
| `4` | B button      | `b`      | `btn`      |
| `5` | Left joystick | `l`      | `joy`      |

## Super NES

The Super NES dog-bone controller without the shoulder buttons.

- ID: `2`
- JSON ID: `snes`

| ID  | Input Name    | JSON ID  | Input type |
| --- | ------------- | -------- | ---------- |
| `1` | Start button  | `start`  | `btn`      |
| `2` | Select button | `select` | `btn`      |
| `3` | A button      | `e`      | `btn`      |
| `4` | B button      | `s`      | `btn`      |
| `5` | X button      | `n`      | `btn`      |
| `6` | Y button      | `w`      | `btn`      |
| `7` | Left joystick | `l`      | `joy`      |

## Twinstick

Two analog joysticks with two buttons next to the right stick. The right stick is smaller to make room.

- ID: `3`
- JSON ID: `twinstick`

| ID  | Input Name     | JSON ID  | Input type |
| --- | -------------- | -------- | ---------- |
| `1` | Start button   | `start`  | `btn`      |
| `2` | Select button  | `select` | `btn`      |
| `3` | A button       | `a`      | `btn`      |
| `4` | B button       | `b`      | `btn`      |
| `5` | Joystick left  | `l`      | `joy`      |
| `6` | Joystick right | `r`      | `joy`      |
