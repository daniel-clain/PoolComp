# Pool Comp Companion — Project Documentation

## 1. Project Philosophy

This app is not designed to replace the existing paper‑based system by force. Instead, it acts as an **enhancement layer**:

- The paper system remains the primary source of truth for live competitions.
- The app provides value‑added tools that remove friction, reduce errors, and unlock insights.
- Every module is **loosely coupled** — users can adopt one feature, ignore others, and later compose them into a full digital workflow if they choose.
- No feature creates a dependency on the app. If the app stops working, the paper system continues unaffected.

The long‑term goal is to offer a progressive path:

1. **Helper mode** – individual tools that assist specific manual tasks.
2. **Hybrid mode** – the app maintains a digital mirror that stays in sync via OCR.
3. **Full digital mode** – the app becomes the primary interface, with paper as backup.

---

## 2. Core Modules (Loosely Coupled)

Each module is independent. Modules can be built, tested, and delivered in any order.

| Module                     | Responsibility                                                                                                                | Key Input                                          | Key Output                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| **Player Registry**        | Maintain a persistent list of known players, their handwriting signatures, and optional metadata (e.g., paid status history). | Manual entry, OCR from entry sheets.               | Normalized player list for match generation, payment tracking. |
| **Match Generator**        | Generate random first‑round matchups from a given set of players.                                                             | List of players (from Registry).                   | Printable / viewable first‑round bracket.                      |
| **Bracket Viewer**         | Display tournament bracket on mobile/tablet. Read‑only mirror initially, later editable.                                      | Bracket structure + match results (manual or OCR). | Visual bracket that players can view on their phones.          |
| **Prize Money Calculator** | Compute weekly prize splits, monthly jackpot contributions, and Christmas fund based on entrant count and custom rules.       | Player count, paid status, configurable rules.     | Clear payout breakdown (printable).                            |
| **Historical Archive**     | Store completed match results, generate long‑term statistics (win rates, frequent matchups, season summaries).                | Results from bracket (OCR or manual).              | Historical reports, trend data.                                |

---

## 3. Data Persistence Strategy

---

## 4. Iterative Development Phases

Build in small, functional increments. Each phase should deliver a usable tool.

### Helper Tools (Lowest Friction)

- **Player Registry** – manual add/edit of players.
- **Match Generator** – takes a selected list of players, outputs random first‑round matches (text + simple visual).
- **Prize Money Calculator** – manual entry of player count, displays payout breakdown.

---

### OCR Entry Scanner

- Camera screen that captures an entry sheet (handwritten or printed names).
- Uses the **Player Registry** to match scanned text to known players (fuzzy matching + handwriting signature).
- Wizard UI for unrecognized names (add as new player or map to existing).
- After confirmation, the app knows which players are in the current competition.
- (Optional) Update paid status from checkboxes on the same sheet.

_Goal_: Eliminate manual entry of names. Paper remains the source; app reads it.

---

### Bracket Viewer & Scanner

- **Bracket Viewer** – display a tournament bracket on screen. Optimized for phones (collapsible rounds, zoom/pan).
- **Bracket Scanner** – camera captures the paper bracket after matches are played.
- OCR extracts match results; the app updates the digital bracket.
- Players can now view the updated bracket on their own phones without crowding the paper sheet.

_Goal_: Paper bracket stays on the table; app provides a convenient digital mirror.

---

### Historical Archive & Reporting

_Goal_: Turn historical data into insights that were previously impractical to produce manually.
