_May be a little out of date_

# Terminology

- **Client**: A device that is connected to the WebSocket.


# Networking overview

## Handshake

1. HTTP server starts.
2. WebSocket server starts.
3. Client opens website in a browser.
4. Website on client connects to WebSocket.
5. Client sends a **`session`** packet with a `session_id` from sessionStorage or generator.
6. Sever sends **`queue`** packets until it reaches `0`. If there is no queue then `0` is sent indicating that the server is ready for the client to join.
7. Server either assigns the client to the controller with a matching `session_id` or creates a new one.
8. Server sends a **`layout`** packet to initialize the client to the correct.controller layout. A responce via a **`layout_ready`** packet from the client is not expected by the server.
9. Both will now periodically send **`ping`** and respond with **`pong`** packets.
10. Now move on to [normal flow](#normal-flow).


## Normal flow

1. Client sends **`input`** packets relating the current state of inputs from controller.

## Layout change

1. Server stops listening to inputs.
2. Server sends **`layout`** packet with a desired `layout_id`.
3. Client switches the controller to the layout.
4. Client send a **`layout_ready`** packet with the `layout_id` to indicate the layout has been updated.
5. Server waits for all clients to respond with **`layout_ready`**. 
6. Server resumes listening to inputs. Any inputs during the period have been ignored as the packets may relate to an different layout.
