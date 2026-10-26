---
title: Impacts — what an obstacle costs
type: spec
status: planned
depends_on: [game/run.md, models/obstacles/stray-pins.md, models/obstacles/returning-ball.md, models/obstacles/rental-shoes.md, models/obstacles/sweep-bar.md, models/obstacles/widening-gutter.md]
canonical: []
verified: 2026-10-26
---

# Impacts

> Boundary: collision detection between the ball and the obstacles of the track, and its cost.
> NOT covered: the pins at the end ([pins physics](pins.md)), the obstacle models (`models/obstacles/*`).

## Purpose

The ball never stops and never dies: the demo always reaches the pins. An impact is paid later, in
pins, because it costs speed and aim.

## Rules

1. **Detection is domain logic**, not the physics engine: each step, the ball's footprint (from the
   ball measures, at its interpolated `x`, `z` and height) is tested against the footprints of the
   track's obstacles (from `models/src/measures/`). A `returning-ball` is tested at its position at
   that moment (`z(t) = z0 − speedMps · t`, from when the run started). An airborne ball clears an
   obstacle if its lowest point is above the obstacle's height.
2. **Each obstacle can be hit once.** On impact:
   - speed is multiplied by `1 − IMPACT_SPEED_LOSS` (0.25), then recovers at `ACCEL_MPS2`;
   - the aim error grows by a seeded uniform value in ±`IMPACT_AIM_ERROR_M` (0.04 m), applied to the
     ball's `x` when it reaches the pin deck;
   - the impact count grows by one, and an impact event is emitted (for the scene and the audio).
3. **Widening gutter:** a ball inside its lane and range counts one impact and is steered to the
   nearest free adjacent lane by a forced lane change.
4. **The scene reacts, the domain does not care:** the hit obstacle is knocked away by a Havok
   impulse proportional to the ball speed, for show only; its later motion never affects the run.
5. Values in `game/src/config/impacts.ts`.

## Acceptance criteria

1. [auto] Unit tests, one per obstacle kind: a ball in the obstacle's lane at its `z` registers one
   impact; a ball in another lane registers none; for rental shoes and sweep bar, a ball at jump
   apex registers none; a returning ball is hit where it is at that time, not where it started.
2. [auto] Unit test: after an impact at 12 m/s the speed is 9 m/s and recovers to the target at
   1.5 m/s².
3. [auto] Unit test: the same track, seed and command sequence produce the same aim error.
4. [human] An impact is visible and readable: the obstacle flies, the ball visibly slows.

## References

_Filled by the agent (prompt 1, step 2)._

## Rounds

_Filled by the agent (prompt 1, step 5)._
