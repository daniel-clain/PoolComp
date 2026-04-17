# Backend

The server between the frontend and persistence. It applies **domain commands**, persists the result, and pushes **shared state** to clients over WebSocket.

For how frontend, backend, and the repo-root **`shared/`** TypeScript package divide responsibility, see [Frontend and backend architecture](frontend-backend-architecture.md).

## Responsibilities

- **Domain commands** — Validates and applies each client command (create comp, toggle players, start comp, etc.), runs authoritative business logic on the server, and rejects invalid transitions.
- **Persistence** — Stores the player registry, active comp, and completed comps in **MongoDB**. Each command updates **only the documents that change** (for example `insertOne` / `replaceOne` / `deleteOne` on a single player or the single active-comp document). The server does **not** replace entire collections on every action. After a successful write, it **reloads** snapshot state from the database and broadcasts it so every client matches persisted data. **Multi-document steps** (for example completing a comp: append history, then remove the active comp) run as sequential writes; use a replica set and transactions in production if you need atomicity across both.
- **WebSocket** — Accepts commands from the frontend, broadcasts `stateSnapshot` / `stateUpdated` so every connected client sees the same data.

## Why WebSocket

The app is used during a live comp where multiple people may be viewing on their own devices. WebSocket lets the backend push state changes to all connected clients without polling.

## Relates to

- [Frontend and backend architecture](frontend-backend-architecture.md) — command flow and who owns which logic.
- [Player registry](player-registry.md) — the backend persists and serves the registry data.
- [Pool comp history](pool-comp-history.md) — historical comp records and broadcasts to clients.
- [Prize money](prize-money.md) — prize preview derived from server state so every client sees the same amounts.
- [First-round slot distribution](first-round-slot-distribution.md) — bracket fairness; enforced when the comp is started on the server.
