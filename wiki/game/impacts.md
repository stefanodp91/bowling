---
title: Impacts — what an obstacle costs
type: spec
status: planned
depends_on: [game/run.md, models/obstacles/stray-pins.md, models/obstacles/returning-ball.md, models/obstacles/rental-shoes.md, models/obstacles/sweep-bar.md, models/obstacles/widening-gutter.md]
canonical: [game/src/config/impacts.ts, game/src/domain/impacts/, game/src/domain/simulation.ts, game/src/scene/views/knock-away.ts, game/src/scene/views/obstacle-view.ts, game/src/scene/physics/]
verified: 2026-10-27
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
   - speed is multiplied by `1 − IMPACT_SPEED_LOSS` (0.4), then recovers at the run's `ACCEL_MPS2`
     (0.5 m/s², [run](run.md)), slowly enough that an impact in the last ≈ 100 m still reaches the
     pins slower;
   - the aim error grows by a seeded uniform value in ±`IMPACT_AIM_ERROR_M` (0.24 m: 0.12 m at
     regulation size, the distance that moves a pocket hit to the Brooklyn side or the split zone,
     × `PROP_SCALE`), applied to the ball's `x` when it reaches the pin deck;
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
2. [auto] Unit test: after an impact at 12 m/s the speed is 7.2 m/s and recovers to the target at
   0.5 m/s².
3. [auto] Unit test: the same track, seed and command sequence produce the same aim error.
4. [human] An impact is visible and readable: the obstacle flies, the ball visibly slows.

## References

- One-dimensional elastic collision: a body of mass m hit by mass M at speed v leaves at
  2M/(M + m)·v (https://en.wikipedia.org/wiki/Elastic_collision#One-dimensional_Newtonian) —
  used only to size the show impulse.
- Babylon physics v2: bodies on transform nodes, box shapes, `applyImpulse`
  (https://doc.babylonjs.com/features/featuresDeepDive/physics/rigidBodies).

## Rounds

- 2026-10-27 · round 1 · Built detection in the domain (`domain/impacts/`: footprints placed at
  run time, a box test against the ball's square footprint, a terrain obstacle catching only a
  ball on the lane), the cost (speed × 0.75, a seeded aim error drawn from track seed and
  obstacle index, so the error does not depend on the order of earlier draws), the widening
  gutter's forced lane change to a free adjacent lane, and `worldStep` (run step + impacts) used
  by the session. For the show: Havok through Babylon's plugin, stepped by the simulation's fixed
  steps, and a mesh-less box body carrying the hit obstacle's model. Wrong on the way: (a) the
  floor and proxy were invisible meshes without material — the tree-shaking trap of AGENTS.md,
  «StandardMaterial needs to be imported» — so bodies now sit on bare transform nodes; (b) the
  first impulse (0.6 N·s per m/s) let the ball and camera overtake the shoes in half a second:
  the impulse now follows the elastic-collision ratio and the obstacle flies ahead. Shots: 4
  (a real impact on lane-01's shoes at 152 m: 250 ms later the shoes are high and ahead, tumbling;
  the ball went from ≈ 7.5 to 6.1 m/s). Unit tests: one per kind (hit in lane, miss in another
  lane), sweep bar and shoes cleared at jump apex, returning ball hit where it is at that time,
  each obstacle once, gutter push, 12 → 9 m/s and recovery at 1.5 m/s², same aim error twice.

- 2026-10-27 · round 2 · `check-pilot`'s selftest (an «impossible» track with stray pins across
  all three lanes) passed when it should fail: the perfect pilot jumped the pins — 0.38 m tall,
  under the 0.5 m apex. The obstacle pages say stray pins and the returning ball are not
  jumpable, but rule 1 only compared heights. Now `JUMPABLE_KINDS` (`config/impacts.ts`: rental
  shoes and sweep bar) decides: any other obstacle is hit at any height. New unit test; perfect
  still has 0 impacts on every track.

## Canonical files

- `applyImpacts(run, impacts, track)` is pure; `ImpactState` holds one hit flag per obstacle, the
  count and the summed aim error; `ImpactEvent`s go to the scene (and to the audio, once built).
- The scene's physics (`scene/physics/`) disables Babylon's per-frame step: `PhysicsWorld.step()`
  runs once per simulation step. The graphic engine exports no Havok adapter; see
  [review](../review.md).
