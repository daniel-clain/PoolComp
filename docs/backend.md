# Backend

The server that sits between the frontend and persistence. Handles data storage, real-time sync, and domain commands.

## Responsibilities

- **Persistence** — stores the player registry, active comp, and completed comps (for example in Google Sheets or in-memory when not configured).
- **WebSocket** — real-time connection between the backend and the frontend. The frontend sends commands; the backend applies them, persists, and broadcasts updated state.

## Why WebSocket

The app is used during a live comp where multiple people may be viewing on their own devices. WebSocket allows the backend to push state changes to all connected clients without polling.

## Relates to

- [Player Registry](player-registry.md) — the backend persists and serves the registry data.
- [Bracket Scanner](bracket-scanner.md) — bracket mirroring updates comp state on the backend, which broadcasts to all connected clients via WebSocket.
- [Pool Comp History](pool-comp-history.md) — backend stores historical comp records and broadcasts updates to connected clients.
- [Prize Money](prize-money.md) — backend can compute and broadcast prize totals so every connected client sees the same amounts.
- [Philosophy](philosophy.md) — the backend enables features but never makes them mandatory. If the server is down, the paper system is unaffected.