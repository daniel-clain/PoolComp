# Pool Comp History

Capture historical comp records from the paper spreadsheet into searchable digital data.

## Purpose

- Preserve completed comp outcomes for future comparison and reporting.
- Keep the paper spreadsheet as the source of truth; the app is an optional mirror.

## Input source (current direction)

Data is entered **manually** in the app (or imported from persistence such as Google Sheets). There is no camera or OCR pipeline.

Today, one way history appears in state is when an **active comp is completed** in the app: that snapshot is appended to the historical list. Richer rows that match every column on the paper ledger can be added later with dedicated forms or imports.

## Paper ledger column reference (V1)

If you add forms or imports later, these are the canonical field keys that match the usual paper columns:

- `Date` -> `date`
- `#players` -> `playerCount`
- `Buy-in` -> `buyIn`
- `Cash added to Jackpot` -> `cashAddedToJackpot`
- `Monthly Jackpot total` -> `monthlyJackpotTotal`
- `Xmas Side pot` -> `xmasSidePot`
- `1st place` -> `firstPlace`
- `2nd place` -> `secondPlace`
- `Monthly Jackpot` -> `monthlyJackpotWinnerNote`

## Flow (target)

1. Comp manager reads values from the paper history table.
2. Enters or edits the corresponding row in the app (or syncs from a shared sheet).
3. Backend persists and broadcasts so every connected client sees the same data.

## Data quality

- Normalize dates, currency, and names before persistence.
- Prefer matching winner names against the [Player Registry](player-registry.md).

## Guiding constraints

- Optional feature; pool comp can run without a full digital history.
- Paper remains authoritative if the app and paper disagree.

## Relates to

- [Backend](backend.md) — storage and broadcast of historical records.
- [Player Registry](player-registry.md) — consistent spelling for historical names.
- [Prize Money](prize-money.md) — historical context for validation.
- [Philosophy](philosophy.md) — paper remains the source of truth; app features remain optional.