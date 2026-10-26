---
title: Sweep bar — the pinsetter's rake across all three travel lanes
type: spec
status: planned
depends_on: [models/lane.md]
canonical: []
verified: 2026-10-26
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
   surface; the top edge at `SWEEP_BAR_HEIGHT_M` (0.30 m), below the jump apex.
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

_Filled by the agent (prompt 1, step 2): photos and descriptions of pinsetter sweeps and rakes._

## Rounds

_Filled by the agent (prompt 1, step 5)._
