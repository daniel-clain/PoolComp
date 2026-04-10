# Player Registry

A persistent list of known players. This is the reference dataset for building the weekly entrant list and for display elsewhere in the app.

## What It Stores

- Player names (canonical spelling).
- Optional metadata: paid status history, participation history (as the product grows).

## How It Gets Populated

The comp manager adds and removes players **manually** in the app (or via whatever admin flow the UI provides). Paper sign-in remains the source of truth for who actually turned up; the app registry is the working list for randomization, history, and prize math.

## Relates to

- [Backend](backend.md) — the registry is persisted and accessed through the backend.
- [Prize Money](prize-money.md) — active comp player count drives weekly and monthly prize calculations.
- [Pool Comp History](pool-comp-history.md) — names in history should line up with registry spelling where possible.