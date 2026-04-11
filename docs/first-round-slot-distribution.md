# First-round slot distribution (fair byes)

## The feature

When a comp starts and the first round is fixed, each entered player is assigned to **first-round bracket slots using a random spread across the whole round**, not by filling the visible column from top to bottom in list order.

## Why it is necessary

The bracket size is the next power of two that fits the player count (e.g. nine players use sixteen first-round slots). The slots that stay empty are **byes**: whoever is next to an empty slot advances without playing that round.

If players are placed only in the first *k* slots from the top, empty slots pile up at the bottom. Players near the bottom of the list then sit in a part of the tree with many byes and can reach the final after far fewer games than players at the top, who fight through a dense half of the bracket. List order must not imply that kind of advantage.

Random placement across **all** first-round positions fixes that: any slot can be empty or occupied; over the structure of the tree, byes are not systematically stacked on one end. Pairings and progression stay a normal single-elimination bracket; only **where** names land in round one changes.

## How the solution works (logic)

1. **Bracket width** — Choose the smallest first-round size that is a power of two and at least the number of players (e.g. nine players → sixteen slots).
2. **Slots** — Treat first round as a fixed list of that many positions (the leaves of the bracket).
3. **Assignment** — After players are confirmed for the comp, shuffle the player list (or draw at random). Choose a **random subset** of exactly *player count* distinct slot indices (or equivalently: shuffle all slot indices and take the first *k* for players, then assign shuffled players to those slots). Remaining slots stay empty (byes).
4. **Start** — When the comp is started, persist and display this assignment so round-one matchups reflect the spread layout, not registration order.

The UI may still show the bracket in a fixed column order; the rule is that **which cells are filled** must follow this distribution, not “first name → top cell, second → next cell,” and so on.

## Relates to

- [Player registry](player-registry.md) — source list of entrants before assignment.
- [Backend](backend.md) — bracket state and randomization should live in persisted comp data, not only in the client.
