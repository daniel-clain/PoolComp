# Player Registry

A persistent list of known players. This is the **reference dataset** for building the weekly entrant list and for display elsewhere in the app.

## What it stores

- Player names (canonical spelling).
- Optional metadata: paid status history, participation history (as the product grows).

## How it gets populated

The comp manager adds and removes players in the app (or via whatever admin flow the UI provides). The registry is the **working source of truth** for who exists in the system for randomization, history, and prize math.

## Relates to

- [Backend](backend.md) — the registry is persisted and accessed through the backend.
- [Prize money](prize-money.md) — active comp player count drives weekly and monthly prize calculations.
- [Pool comp history](pool-comp-history.md) — names in history should line up with registry spelling where possible.
