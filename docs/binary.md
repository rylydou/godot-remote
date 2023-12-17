# Overview

Each packet starts with a `byte` signaling the packed type.
 `0` mean the packet is json, see [JSON](./json.md).

## Reserved Packet IDs

| Description  | ID `byte` | Arguments                                              |
| ------------ | --------- | ------------------------------------------------------ |
| JSON API     | `0`       | [JSON `str`] [(see json api)](./json.md)               |
| Ping         | `1`       | [Timestamp `uint`]                                     |
| Pong         | `2`       | [Timestamp `uint`]                                     |
| Input packet | `>=3`     | [Timestamp `ushort`] [(see arguments)](#input-packets) |



# Input Packets

## Button

- Required IDs: `2`

| Description | Extra ID | Additional Arguments |
| ----------- | -------- | -------------------- |
| Pressed     | `0`      | _(none)_             |
| Released    | `1`      | _(none)_             |


## Joystick

- Required IDs: `1`
- Expanded IDs: `3`

| Description | Extra ID | Additional Arguments    |
| ----------- | -------- | ----------------------- |
| Move*       | `0`      | [x `fixed`] [y `fixed`] |
| Pressed     | `1`      | [x `fixed`] [y `fixed`] |
| Released    | `2`      | [x `fixed`] [y `fixed`] |
