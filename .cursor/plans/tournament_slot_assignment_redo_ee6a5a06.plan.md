---
name: Tournament slot assignment redo
overview: "Implement spec in tournament-slot-assignment: readable service + units, incremental + randomise, byes + auto-advance, wire handlers + UI. Checklist + decisions in doc body."
todos:
  - id: service-units
    content: "tournament-slot-assignment.service.ts: incremental + randomise; step-by-step readable flow. .units.ts: sizing, slice, stale cleanup, expand/remap, two-phase placement, isBye, advance vs-bye, bye-only undo, tournamentHasStarted. No re-exports."
    status: in_progress
  - id: handlers
    content: addPlayerToComp → incremental. removePlayerFromComp → minimal (clear ids only; see stale-id rule). randomiseMatchups → full + guard.
    status: pending
  - id: frontend-messages
    content: "Comp.tsx: Randomise label + disabled when started. messages-from-frontend + shared types if rename still needed."
    status: pending
  - id: tests
    content: "Seed/fake random. v1 matrix: <5, 5+, incremental gaps only, expansion retention, full randomise, guard, plus bye advance path."
    status: pending
isProject: false
---

# Tournament slot assignment

## Pointers (where the truth lives)

- **[matchup-generation.service.ts](backend/src/services/matchup-generation.service.ts)** — **Style** only: short procedural main file, obvious function names, two `while`-style phases for placement; **not** the final feature set (that’s in `tournament-slot-assignment` + your comment).
- **[matchup-generation.service.ts lines 17–28](backend/src/services/matchup-generation.service.ts)** — **Behaviour spec** (verbatim topics below).
- **[docs/first-round-slot-distribution.md](docs/first-round-slot-distribution.md)** — Fair first-round spread (not list-order fill).

## Your spec (topics from the service comment — do not drop these)

1. Add/remove path **does not** full-randomise; keeps existing assignments where valid.
2. **Each add:** run placement for new people into **available** slots.
3. **Expand** first round (e.g. 4→8): **remap** old slots to spread indices (1,3,5,7); new player(s) random into spots; rest byes.
4. **Someone leaves:** that place can become bye; simple is OK.
5. **Paper comp:** manual place **someday** — not required unless message exists.
6. **After remove / at run start:** drop any `playerId` **not** in registered list (see **Stale ids** under Decisions — conflicts with minimal remove unless you add a one-line strip).
7. **Late join:** revert **bye** auto-advances first; clear byes so placement can run.
8. **Manual assign** steals slot → displaced person random to remaining — **only if** wired.
9. **Button** = full fresh assign for **all**; normal add/remove **do not** reshuffle everyone.
10. **Button disabled** when a **next-round** slot already has a `playerId` (match started).
11. **First round** 8–32; play-in / UI density is a **note**, not automatic shrink (you said no contraction).

**New (from you in chat):** first-round empty side = **bye**; player **vs bye** → **auto-advance** `playerId` to the winner’s next-round slot; undo late-join mess **only** for **bye-sourced** advances where you can tell.

## Decisions already chosen (do not re-litigate in code)

- **Code location:** `tournament-slot-assignment/` only; `matchup-generation.*` = your reference, optional hide via `.cursorignore`.
- **&lt; 5 players:** return `[]`.
- **Remove:** **minimal** — clear that player’s ids; **no** incremental assign on the handler.
- **Add:** **incremental** after register.
- **Contraction:** **out** — do not shrink the bracket.
- **Build:** full stack (backend + Comp + messages/types as needed).
- **Stale ids:** incremental always cleans. With minimal remove, use **one** mechanism for roster orphans: tiny strip on remove **or** on next add (pick one; not two systems).

## Rules (single list)

- **Two public functions** in the service: incremental + full randomise. **No** `assignMatchups` wrapper that only forwards.
- **Sizing:** 8–32 first round; no assignment until **5+** players (`<5` → `[]`).
- **Randomise:** guard with `tournamentHasStarted` (or equivalent) on **server**; mirror disable on **UI**.
- **Units:** all heavy logic; **service** stays readable like your example.

## Files to touch (typical)

- [backend/src/services/tournament-slot-assignment/tournament-slot-assignment.service.ts](backend/src/services/tournament-slot-assignment/tournament-slot-assignment.service.ts)
- [backend/src/services/tournament-slot-assignment/tournament-slot-assignment.units.ts](backend/src/services/tournament-slot-assignment/tournament-slot-assignment.units.ts)
- [backend/src/messages-from-frontend/addPlayerToComp/addPlayerToComp.ts](backend/src/messages-from-frontend/addPlayerToComp/addPlayerToComp.ts)
- [backend/src/messages-from-frontend/removePlayerFromComp/removePlayerFromComp.ts](backend/src/messages-from-frontend/removePlayerFromComp/removePlayerFromComp.ts)
- [backend/src/messages-from-frontend/randomiseMatchups/randomiseMatchups.ts](backend/src/messages-from-frontend/randomiseMatchups/randomiseMatchups.ts) (or current name)
- [frontend/src/views/Comp/Comp.tsx](frontend/src/views/Comp/Comp.tsx)
- [backend/src/messages-from-frontend/messages-from-frontend.ts](backend/src/messages-from-frontend/messages-from-frontend.ts)
- Tests under `tournament-slot-assignment/`

## Test matrix (from [v1 plan](.cursor/plans/matchup_generation_upgrade_2d48979e.plan.md) + your additions)

- &lt;5 → no real assignment / `[]` behaviour
- 5+ → bracket turns on
- Incremental add → only fills gaps / new structure; does not shuffle everyone
- Expansion (e.g. 8→9 needs 16) → **relative** positions kept where required
- Full randomise → can change everything vs prior
- Randomise **rejected** when next round has a `playerId`
- **Bye** + **auto-advance** to next slot; late-join **bye** undo (where testable)
- Use **seeded / injectable** random so tests are stable

**Not in this build unless already wired:** manual assign, bracket contraction, play-in layout polish.
