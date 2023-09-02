# Notes

## Intended strange behaviors and justifications

**Scenario**: A client a connects but it's session id is already being actively used by another client.

**Result**: The new client takes over the controller and the previous client get kicked and the websocket connection is closed.

**Justification**: The previous client may have been bugged which caused the user to open a new connection. The old client should be ignored.

---
