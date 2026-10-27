---
title: Sweep bar — the pinsetter's rake across all three travel lanes
type: spec
status: planned
depends_on: [models/lane.md]
canonical: [models/src/obstacles/sweep-bar/, models/src/measures/obstacles.ts, storybook/src/stories/obstacle-sweep-bar.stories.tsx, game/src/domain/obstacles/jump-clearance.test.ts]
verified: 2026-10-27
---

# Sweep bar

> Boundary: the sweep-bar obstacle model and its footprint. NOT covered: what happens on impact
> ([impacts](../../game/impacts.md)).

## Purpose

The only obstacle that blocks every lane: the pilot must jump, so it is where a mistimed jump shows.

## Rules

1. A pinsetter sweep: a long painted metal guard board hanging from two arms at the outer edges,
   spanning the whole playing surface (three travel lanes and both gutters). It swings gently back
   and forth along `z` (amplitude and period are tunables), without ever leaving its footprint.
2. Measures (`models/src/measures/obstacles.ts`): the bottom edge of the board is at the lane
   surface; the top edge at `SWEEP_BAR_HEIGHT_M` (0.30 m × `PROP_SCALE` = 0.60 m, like every prop,
   [conventions](../conventions.md)), below the jump apex. Its width stays the lane's.
3. Footprint: the full width; depth = board thickness plus the swing amplitude.
4. Overcome by: jumping only.

## Acceptance criteria

1. [auto] Story `models-obstacle-sweep-bar` shows the swing and reaches ready.
2. [auto] A unit test in `game/` checks the board's top edge is below the jump apex of
   `game/src/config/run.ts` (the height of the ball's lowest point at the top of the jump). Until
   the [run](../../game/run.md) page is built, the test is written and skipped with a reason naming
   that page.
3. [human] Reads as part of a bowling machine, not a fence.

## References

- The sweep (rake) of a pinsetter is a board that lowers across the lane as a guard and then moves
  over the deck to push dead wood into the pit; it hangs from the machine above the deck
  (https://en.wikipedia.org/wiki/Pinsetter; patent US2657929A «Sweep and guard mechanism for
  bowling pin setting machines», https://patents.google.com/patent/US2657929A/en; Brunswick GS
  service manual, https://brunswickbowling.com/uploads/document-library/Service-Manuals/Pinsetters/GS/Service-Manuals_GS-Service-Manual-Full-47-902735-000-Rev-1-10-18.pdf).

## Rounds

- 2026-10-26 · round 1 · Built a red guard board with a white stripe and a steel top lip, two arms
  to pivots at 1.4 m, swinging as a pendulum. The unit test found that the swung lip rose 3.5 mm
  above 0.30 m: the footprint now contains the whole swing — depth = lip + amplitude, height
  derived from the largest angle (≈ 0.3035 m), and the angle is set so the bottom edge, the
  farthest point, moves exactly ± the amplitude. 1 shot: a thin black frame over a red board read
  as a fence or a goal, and the metal mirrored the dark alley into black.
- 2026-10-26 · round 2 · Added the machine housing the arms hang from (charcoal, yellow/black
  hazard band), crank plates on the pivots, painted (partly metallic) lighter steel. 1 shot: reads
  as the underside of a pinsetter with its sweep down. Left for the human: the housing floats with
  no visible support, which a 500 m lane cannot give it.

## Canonical files

- `createSweepBar(scene, { swingPeriodS })`: the period is the game's tunable; the amplitude is a
  measure, because the footprint depends on it. `animate(t)` sets the pendulum angle
  `SWEEP_SWING_ANGLE_RAD · sin(2πt / period)`.
- The test samples five instants of the swing and checks the board and lip stay inside
  `SWEEP_BAR_FOOTPRINT` and span the playing surface.
