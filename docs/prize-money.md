# Prize Money

Calculates weekly and monthly prize allocations from entrant count and fixed rules.

## Weekly Regular Comp

Three outputs are calculated from the current player count:

- **First Prize** = (BuyIn x Players / 2) + BarInput
- **Big Comp Fund** += (BuyIn x Players / 2) - XmasCut
- **Christmas Fund** += XmasCut

Default values:

- BuyIn = $10
- BarInput = $50
- XmasCut = $20

Example with 16 players:

- First Prize = ($10 x 16 / 2) + $50 = $130
- Big Comp Fund contribution = ($10 x 16 / 2) - $20 = $60
- Christmas Fund contribution = $20

This recalculates live when the active comp player list changes (for example, toggling who is in this week's comp).

## Monthly Big Comp (3rd Thursday)

The regular weekly contribution logic still runs each week and feeds the next month's big comp fund.  
On big comp day, the accumulated fund from the prior month becomes the prize pool.

Split rules:

- **Main tournament** = 70% of total pool
  - Main 1st place = 70% of main (49% of total)
  - Main 2nd place = 30% of main (21% of total)
- **2nd chance tournament** = 30% of total pool
  - 2nd chance 1st place = full 30%
  - 2nd chance 2nd place = 2 x $20 dining vouchers
- Eligibility: players who lose in round 1 enter 2nd chance, unless they came 1st within the last 6 weeks.

## Guiding constraints

- Calculations are reactive to current active comp player count.
- The backend computes and broadcasts totals so every client sees the same numbers.

## Relates to

- [Player registry](player-registry.md) — active comp player count is the core input.
- [Backend](backend.md) — calculation runs on the backend so all connected clients see consistent values.
- [Pool comp history](pool-comp-history.md) — historical records support month-to-month comparison and validation of prize outcomes.