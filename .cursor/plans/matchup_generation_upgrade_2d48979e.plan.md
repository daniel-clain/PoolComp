---
name: Matchup Generation Upgrade
overview: "Implement a two-mode matchup system: incremental auto-assignment on player add (minimum 5 players, preserve existing positions), plus a full Randomise Matchups action for fresh shuffles, with disable-after-start guard."
todos:
  - id: define-two-generation-flows
    content: Implement declarative high-level service functions for incremental assignment and full randomise using encapsulated unit helpers.
    status: completed
  - id: implement-low-level-units
    content: Add helper functions for minimum gate, stale cleanup, expansion remap, bye/auto-advance reversal, and targeted slot assignment.
    status: completed
  - id: wire-add-and-randomise-actions
    content: Auto-run incremental generation on add-player; update message handler and shared message types for Randomise Matchups full reshuffle.
    status: completed
  - id: update-frontend-randomise-button
    content: Rename Create Matchups UI/action to Randomise Matchups and preserve disable-after-start behavior.
    status: completed
  - id: add-regression-tests
    content: Write deterministic tests for player thresholds, expansion retention, incremental assignment behavior, and randomise guard conditions.
    status: completed
isProject: false
---

# Matchup Generation Upgrade Plan

## Goal
Finish and harden backend matchup generation so it matches your notes: incremental assignment on add, round expansion with relative-position retention, bye/auto-advance reversal on late add, and explicit full reshuffle via a renamed Randomise Matchups action.

## Implementation Steps

- Update the high-level declarative orchestration in [d:\Repos\PoolComp\backend\src\services\matchup-generation.service.ts](d:\Repos\PoolComp\backend\src\services\matchup-generation.service.ts) to expose two clear flows:
  - `assignMatchupsIncrementally(...)` for automatic add-player behavior (no full reshuffle).
  - `randomiseAllMatchups(...)` for button-triggered full fresh shuffle.
- Expand low-level helpers in [d:\Repos\PoolComp\backend\src\services\matchup-generation.units.ts](d:\Repos\PoolComp\backend\src\services\matchup-generation.units.ts) so each helper is encapsulated and descriptive, including:
  - Minimum-player gate (`<5` means no assignment).
  - Tournament sizing with first-round caps (8 min once active, up to 32 max based on your note).
  - Cleanup of stale slot player IDs not in `registeredPlayerIds`.
  - Detection of unassigned players and available target slots.
  - Relative-position remap when first-round size expands (example: 4->8 maps old indices to even-spaced new indices).
  - Revert of bye-based auto-advances when late players are inserted.
  - Assignment strategy that fills byes/empty slots for newly added players without disturbing existing assigned players.
- Wire automatic incremental assignment into add-player flow in [d:\Repos\PoolComp\backend\src\messages-from-frontend\addPlayerToComp\addPlayerToComp.ts](d:\Repos\PoolComp\backend\src\messages-from-frontend\addPlayerToComp\addPlayerToComp.ts):
  - After adding a registered player, regenerate slots via incremental flow and persist.
  - Preserve current behavior that remove does not trigger reshuffle (your selected rule: add-only).
- Keep/remove handling aligned with your notes in [d:\Repos\PoolComp\backend\src\messages-from-frontend\removePlayerFromComp\removePlayerFromComp.ts](d:\Repos\PoolComp\backend\src\messages-from-frontend\removePlayerFromComp\removePlayerFromComp.ts):
  - Ensure stale player IDs are dropped from slots at start of generation.
  - Do not auto-randomise everyone on removal.
- Rename frontend/backend action semantics from Create Matchups to Randomise Matchups while preserving message-contract safety:
  - UI label and send call in [d:\Repos\PoolComp\frontend\src\views\Comp\Comp.tsx](d:\Repos\PoolComp\frontend\src\views\Comp\Comp.tsx).
  - Handler/module naming and registry in [d:\Repos\PoolComp\backend\src\messages-from-frontend\messages-from-frontend.ts](d:\Repos\PoolComp\backend\src\messages-from-frontend\messages-from-frontend.ts) and [d:\Repos\PoolComp\backend\src\messages-from-frontend\createMatchups\createMatchups.ts](d:\Repos\PoolComp\backend\src\messages-from-frontend\createMatchups\createMatchups.ts) (either rename file/function or add alias then cleanly migrate).
  - Shared message typing in [d:\Repos\PoolComp\shared\messageToBackend.ts](d:\Repos\PoolComp\shared\messageToBackend.ts).
- Preserve disable rule for randomisation once tournament progress exists:
  - Keep frontend disabled logic and update predicate naming/text accordingly in [d:\Repos\PoolComp\frontend\src\views\Comp\Comp.tsx](d:\Repos\PoolComp\frontend\src\views\Comp\Comp.tsx).
  - Add/confirm backend-side guard in randomise handler so UI bypass cannot reshuffle started brackets.
- Add deterministic tests for both orchestration and helper logic:
  - Replace ad-hoc test scaffolding in [d:\Repos\PoolComp\backend\src\services\matchup-generation.service.test.ts](d:\Repos\PoolComp\backend\src\services\matchup-generation.service.test.ts) and [d:\Repos\PoolComp\backend\src\services\matchup-generation.units.test.ts](d:\Repos\PoolComp\backend\src\services\matchup-generation.units.test.ts) with concrete assertions for:
    - `<5` players -> no assignments.
    - 5 players -> first active bracket assignment behavior.
    - Incremental add fills bye/empty slots only.
    - 8->9 expansion to 16 with retained relative positions.
    - Full randomise disregards existing slot positions.
    - Randomise rejected when next-round progress exists.

## Validation

- Run backend tests for matchup generation and message handling.
- Verify frontend button text/action changed to Randomise Matchups and still routes to tournament panel.
- Confirm no lint errors in touched frontend/backend files.
