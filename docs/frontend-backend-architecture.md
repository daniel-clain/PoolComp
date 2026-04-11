# Frontend and backend responsibilities

This document records the **strategy** for how the app is structured. It is the human reference for boundaries and data flow. **Implementation checklists and task plans** live in Cursor plan files (`.cursor/plans/`), not here.

## Roles

- **Backend** — Authoritative **business logic**: validation, state transitions, random or rule-driven outcomes (e.g. official bracket placement when a comp starts), and **persistence**. It is the single source of truth for “what happened.”
- **Frontend** — Holds **replicated state** from the server for **rendering the UI**, captures **user intent**, and **sends commands** (with any parameters the protocol allows). It does not invent authoritative outcomes and ask the server to store them blindly.
- **`shared/`** (repo root, sibling to `frontend/` and `backend/`) — **TypeScript** used by both sides: WebSocket **command and message types**, **domain model / snapshot shapes**, and **pure functions** with no I/O (e.g. bracket sizing and label rules) so preview and server logic stay identical. **Do not** duplicate those types or rules only under `frontend/` or `backend/`.
- **Frontend-only** types (views, React context shapes) stay under `frontend/`. **Backend-only** types (e.g. sheet row layouts, infra) stay under `backend/`.

## Data flow (typical)

1. User acts in the UI → frontend sends a **command** over the WebSocket.
2. Backend runs **domain logic**, updates persisted state, may broadcast **`stateUpdated`** / **`stateSnapshot`**.
3. Frontend replaces or merges **shared state** and re-renders.

Reconnects and multiple clients rely on the server snapshot, not on client-only calculations for authoritative facts.

## Pool comp (example)

- **Before start** — Roster edits are commands; bracket **preview** (e.g. sequential fill in round one) may use **`shared/`** pure helpers for display only.
- **Start comp** — Backend computes **official** first-round layout (including fair bye distribution), persists it, and clients render from the snapshot. Details of bracket rules live in [`first-round-slot-distribution.md`](first-round-slot-distribution.md).

## Related

- [Backend](backend.md) — persistence, WebSocket, and command handling.
- [First-round slot distribution](first-round-slot-distribution.md) — bracket fairness rule.
- [Player registry](player-registry.md) — roster vs comp entrants.
