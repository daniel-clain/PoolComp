# Pool Comp History

Digital record of **completed** pool comps: outcomes and metadata the app persists and shows everywhere (for example after **Complete Comp** on an active comp). The app is the **primary** system for this history; there is no separate paper workflow the product must mirror.

## Purpose

- Preserve completed comp outcomes for comparison and reporting inside the app.
- Keep one shared history backed by the backend so every connected client sees the same rows.

## How records appear today

When an **active comp is completed** in the app, that snapshot is appended to the historical list and persisted (for example via Google Sheets). Richer fields or bulk import can be added later with dedicated forms or imports without changing the idea that **the app store is authoritative**.

## Legacy spreadsheet column reference

If you import rows from an older venue spreadsheet, these field keys can map familiar columns to structured data:

- `Date` -> `date`
- `#players` -> `playerCount`
- `Buy-in` -> `buyIn`
- `Cash added to Jackpot` -> `cashAddedToJackpot`
- `Monthly Jackpot total` -> `monthlyJackpotTotal`
- `Xmas Side pot` -> `xmasSidePot`
- `1st place` -> `firstPlace`
- `2nd place` -> `secondPlace`
- `Monthly Jackpot` -> `monthlyJackpotWinnerNote`

## Data quality

- Normalize dates, currency, and names before persistence.
- Prefer matching winner names against the [Player registry](player-registry.md).

## Relates to

- [Backend](backend.md) — storage and broadcast of historical records.
- [Player registry](player-registry.md) — consistent spelling for historical names.
- [Prize money](prize-money.md) — historical context for prize outcomes over time.
