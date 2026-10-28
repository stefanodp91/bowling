---
title: Impacts — what an obstacle costs
type: spec
status: built
depends_on: [game/run.md, models/obstacles/wet-floor-sign.md, models/obstacles/returning-ball.md, models/obstacles/rental-shoes.md, models/obstacles/soda-cans.md, models/obstacles/widening-gutter.md]
canonical: [game/src/config/impacts.ts, game/src/domain/impacts/, game/src/domain/simulation.ts, game/src/scene/views/knock-away.ts, game/src/scene/views/obstacle-view.ts, game/src/scene/physics/]
verified: 2026-10-28
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
   - speed is multiplied by `1 − IMPACT_SPEED_LOSS` (0.2) — a dip the eye catches — then the ball
     recovers to the clean curve at the run's `RECOVERY_MPS2` (1.5 m/s², [run](run.md) rule 3), in
     about 1.3 s. A beginner's run therefore lasts about as long as a perfect one: the skills differ
     in what they hit and how the pins fall, not in time (a human's decision of 2026-10-28);
   - the aim error grows by a seeded value between `IMPACT_AIM_ERROR_MIN_M` and `IMPACT_AIM_ERROR_M`
     (0.02–0.04 m: 1–2 cm at regulation size × `PROP_SCALE`), always to the same side within a
     run (the side drawn once from the track seed), so impacts add up instead of cancelling; it is
     applied to the ball's `x` when it reaches the pin deck. It is small on purpose: where a
     beginner meets the pins is the dummy's own miss ([autopilot](../pilot/autopilot.md), rule 5),
     and a few impacts must not push it past the pins into the gutter;
   - the impact count grows by one, and an impact event is emitted (for the scene and the audio).
3. **Widening gutter:** a ball inside its lane and range counts one impact and is steered to the
   nearest free adjacent lane by a forced lane change.
4. **The scene reacts, the domain does not care:** the hit obstacle is knocked away by a Havok
   impulse proportional to the ball speed, for show only; its later motion never affects the run.
5. Values in `game/src/config/impacts.ts`.

## Acceptance criteria

1. [auto] Unit tests, one per obstacle kind: a ball in the obstacle's lane at its `z` registers one
   impact; a ball in another lane registers none; for rental shoes and soda cans, a ball at jump
   apex registers none; a returning ball is hit where it is at that time, not where it started.
2. [auto] Unit test: after an impact at 8 m/s the speed is 6.4 m/s, and within 1.5 s it is back
   on the target speed.
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
- 2026-10-27 · round 4 · The human asked that the skills differ visibly and authorised rewriting
  criterion 2. Speed loss 0.25 → 0.4, recovery at the run's 0.5 m/s². The aim error took three
  campaigns ([skills record](../records/skills-20261027.md)): ± 0.24 m and then ± 0.5 m, of a random
  side each time, changed little — sloppy still struck 10 runs in 15, because errors of opposite
  sides cancel. A deck sweep showed why the size alone could not do it: at twice life size the ball
  strikes anywhere from 0.3 m left to 0.1 m right of the pocket. Now each impact pushes 0.3–0.6 m
  to the side drawn once per run (`aimSideOf`), so impacts add up: perfect 10 pins, good 7.3,
  sloppy 2.5, blind 1.7 over 60 browser runs. Unit tests: criterion 2 as rewritten (12 → 7.2 m/s,
  +0.5 m/s in one second, back to the target), the same side and bounds for every impact of a run,
  criterion 3 unchanged. Left for the human: sloppy is close to blind in pins.
- 2026-10-28 · round 5 · Rule 2: `IMPACT_SPEED_LOSS` 0.4 → 0.2, never below `MIN_ROLL_SPEED_MPS`,
  and never recovered (the run has no target to recover to: a thrown ball only slows). 0.25 made a
  beginner's run of four impacts last 58 s; 0.2 keeps it near 30–50 s. The aim error per impact
  shrinks to 0.02–0.04 m: the beginner's miss at the pins is now the dummy's own
  ([autopilot](../pilot/autopilot.md), rule 5). Criterion 2 rewritten (8 → 6.4 m/s, then the
  lane's drag only) and re-locked on the human's authorization; its test and criteria 1 and 3 green.
- 2026-10-28 · round 6 · Rule 2: the 20 % loss is recovered at the run's 1.5 m/s² (the human asked
  that a beginner's run last as long as a perfect one); criterion 2 rewritten (back on the target
  within 1.5 s) and criterion 1 renamed for the new obstacles — the wet floor sign and the soda
  cans replace the stray pins and the sweep bar — both re-locked on the human's authorization.
  `simulateRun`: dummy runs last 25.9–26.2 s against perfect's 25.8 s.

## Canonical files

- `applyImpacts(run, impacts, track)` is pure; `ImpactState` holds one hit flag per obstacle, the
  count and the summed aim error; `ImpactEvent`s go to the scene (and to the audio, once built).
- The scene's physics (`scene/physics/`) disables Babylon's per-frame step: `PhysicsWorld.step()`
  runs once per simulation step. The graphic engine exports no Havok adapter; see
  [review](../review.md).
