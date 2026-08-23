# Prize Money

Calculates weekly and monthly prize allocations from entrant count and fixed rules.

## Weekly Regular Comp

Three outputs are calculated from the current player count:

- **First Prize** = (BuyIn × Players / 2) + BarInput
- **Big Comp Fund** += (BuyIn × Players / 2) − XmasCut
- **Christmas Fund** += XmasCut

Default values:

- BuyIn = $10
- BarInput = $50
- XmasCut = $20

Example with 16 players:

- First Prize = ($10 × 16 / 2) + $50 = $130
- Big Comp Fund contribution = ($10 × 16 / 2) − $20 = $60
- Christmas Fund contribution = $20

This recalculates live when the active comp player list changes (for example, toggling who is in this week's comp).

## Monthly Big Comp (3rd Thursday)

The same weekly contribution logic still runs on big comp night: half the buy-ins go to this week's normal first prize (+ bar), and the other half minus the Christmas cut is set aside for the **next** big comp.

What makes big comp night different is the prize pool. It is:

**Total big comp prize pool** = this week's normal first prize  
\+ the money set aside from the last big comp  
\+ the money set aside from every normal comp held between that last big comp and tonight

Each contributing week uses the same formula: `(BuyIn × Players / 2) − XmasCut`.

Worked example (20 Aug big comp, 21 players):

| Comp | Players | Set aside |
| --- | --- | --- |
| Last big comp (16 Jul) | 14 | 140/2 − 20 = $50 |
| Normal (23 Jul) | 14 | 140/2 − 20 = $50 |
| Normal (30 Jul) | 15 | 150/2 − 20 = $55 |
| Normal (6 Aug) | 17 | 170/2 − 20 = $65 |
| Normal (13 Aug) | 16 | 160/2 − 20 = $60 |
| **Fund total** | | **$280** |

- This week's normal first prize = 210/2 + $50 = **$155**
- Total big comp prize pool = 155 + 280 = **$435**

Tonight's own big-comp contribution ($155 − $50 bar = half of buy-ins, then − $20 Christmas) is **not** in tonight's prize pool; it starts the fund for the next big comp.

Split rules:

- **Main tournament** = 70% of total pool
  - Main 1st place = 70% of main (49% of total)
  - Main 2nd place = 30% of main (21% of total)
- **2nd chance tournament** = 30% of total pool
  - 2nd chance 1st place = full 30%
  - 2nd chance 2nd place = 2 × $20 dining vouchers
- Eligibility: players who lose in round 1 enter 2nd chance, unless they came 1st within the last 6 weeks.

## Guiding constraints

- Calculations are reactive to current active comp player count.
- The fund window is “since the last big comp (inclusive)”, not a fixed number of weeks — months can have four or five contributing comps.
- Historical big-comp prize pools are calculated from comps dated before that big comp, so later history rows do not change past totals.
- The backend computes and broadcasts totals so every client sees the same numbers.

## Relates to

- [Player registry](player-registry.md) — active comp player count is the core input.
- [Backend](backend.md) — calculation runs on the backend so all connected clients see consistent values.
- [Pool comp history](pool-comp-history.md) — historical records support month-to-month comparison and validation of prize outcomes.
