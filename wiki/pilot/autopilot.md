---
title: Autopilot — the only player, and its two skill profiles
type: spec
status: built
depends_on: [game/impacts.md, game/pins.md]
canonical: [game/src/config/pilot.ts, game/src/pilot/, game/src/domain/deck/hand-off.ts]
verified: 2026-10-28
---

# Autopilot

> Boundary: how the autopilot reads the track and decides each command, its skill profiles, and the
> aim at the pins. NOT covered: running it headlessly and measuring it
> ([headless runs](headless-runs.md)), the buttons that switch skill ([HUD](../game/hud.md)).

## Purpose

Nobody plays this demo: the autopilot does, and it really plays — it reads the same track file as
the scene and decides from it, so what it proves about the game is true for the game. It plays a
perfect game, or a beginner's, chosen in the start menu, so the audience sees mistakes turn into
obstacles knocked away and fewer pins.

## Rules

1. **Pure decision.** `decide(input) → Command` in `game/src/pilot/`, where `input` holds the
   validated track, the run snapshot (`z`, `x`, travel lane, speed, airborne, lane change in
   progress, elapsed time), the active skill profile and a seeded random source. No Babylon, no
   React, no globals. Called once per simulation step.
2. **It reads the track, never the scene.** Obstacles come from the track JSON; their footprints
   from the model measures; the ball's motion from the run's own step function. The pilot reuses
   the domain's collision test to try a command — it never duplicates it.
3. **Time to meet.** For each obstacle ahead, the pilot computes when the ball will reach it, not
   how far it is: for a still obstacle, distance divided by the ball speed; for a returning ball,
   distance divided by the sum of both speeds, because it closes the gap from both sides. Obstacles
   are handled in order of time to meet.
4. **Obstacles that arrive together are one problem.** Obstacles whose times to meet are within
   `GROUP_WINDOW_S` of the first are solved together: the pilot tries the candidate commands
   (`stay`, the lane change towards the centre, the other lane change, `jump`) by simulating the
   short future with the run's step function, and picks the first, in that preference order, that
   clears every obstacle of the group. A jump starts when the time to meet makes the ball's lowest
   point clear the obstacle's height at the moment of crossing (derived from the jump parabola, not
   a hand-tuned number).
5. **Skill profiles** (`game/src/config/pilot.ts`, an `as const` record; a human's decision of
   2026-10-28: «perfect» and «dummy», there were three):

   | Profile | Notices an obstacle at a time to meet of | Chance to ignore a noticed obstacle | Target fixation | Miss at the pins |
   |---|---|---|---|---|
   | `perfect` | 1.0 s | 0 | no | 0 |
   | `dummy` | 0.6 s | 0.40 | yes | 0.45–0.6 m |

   - `perfect` dodges everything and delivers the ball at the pocket: the perfect game, a strike.
   - `dummy` simulates a beginner. It ignores some obstacles, and **fixates** on what it ignores:
     it steers, one lane at a time, towards the lane of an ignored obstacle it meets before any
     obstacle it handles — a beginner steers towards what they stare at. Its ball reaches the pins
     **off the pocket** by a miss drawn once per run, on the side the impacts push to: the band
     where the deck, at every speed a dummy arrives with, leaves 3 to 8 pins down
     (the deck sweep of round 5). So it never strikes, and it knocks
     down some pins.

   The ignore draw happens once per obstacle, when it is first noticed, from the seeded source
   keyed by the obstacle's index: same track, seed and skill changes → same run. Changing skill
   mid-run affects only obstacles noticed afterwards; the miss at the pins is the skill's in charge
   at the hand-over.
6. **The approach.** After the last obstacle the pilot moves to the centre lane and aims at the
   pocket: `x = POCKET_OFFSET_M` to the right of the head pin (owned by
   [pins physics](../game/pins.md), imported, not redefined). That aim target, plus the skill's miss
   and the aim error from impacts, is what pins physics receives.
7. **Simulated runs.** `simulateRun(track, skill, seed) → RunSummary` runs the domain (run,
   impacts, pilot) without a browser up to the pin-deck hand-over and returns impacts, speed and
   aim at the hand-over. Tests and tools use it.

## Acceptance criteria

1. [auto] A test: every profile notices obstacles at least `MIN_REACTION_S` ahead (the track gate's
   constant), so tracks and pilot cannot drift apart.
2. [auto] `simulateRun` with `perfect` on every committed track: zero impacts, centre lane at the
   hand-over.
3. [auto] `simulateRun` with `dummy` on every committed track (the track's seed): at least one
   impact on each track, and the same summary when run twice; a deck simulation of each of those
   hand-overs (its `x` and speed) knocks down between 1 and 9 pins — never a strike, never nothing.
4. [auto] Unit tests on constructed cases: a returning ball is avoided even when a still obstacle is
   nearer in distance but later in time; two obstacles in two lanes at the same `z` lead to the third
   lane; a row of soda cans leads to a jump that clears it; a widening gutter is left before it starts.
5. [human] Watching `Dummy` runs, the pilot's mistakes look like a beginner's, not glitches.

## References

- Planning by short forward simulation with the game's own model, choosing the first acceptable
  action in a fixed preference order — a form of model-predictive control
  (https://en.wikipedia.org/wiki/Model_predictive_control) — here with a horizon of a group of
  obstacles plus a short tail.
- Time to collision for two bodies closing at speeds v₁ and v₂: distance / (v₁ + v₂)
  (https://en.wikipedia.org/wiki/Time_to_collision).

## Rounds

- 2026-10-27 · round 1 · Built `decide` (pure; memory of noticed and ignored obstacles passed in and
  out), time to meet, groups within `GROUP_WINDOW_S` (0.5 s), candidates in the rule's order
  tried by simulating the run's own `step` and the domain's `touches` until the group is passed
  plus `PLAN_TAIL_S`; a jump «starts when it clears» because jumping too early fails that
  simulation, so the pilot waits a step and tries again. The ignore draw is keyed by the run seed
  and obstacle index; the game's run seed is the track seed. `simulateRun` runs the domain without
  a browser in ≈ 0.12 s. Results: perfect has 0 impacts and the centre lane at the hand-over on
  all five tracks; good 6 and sloppy 14 impacts in total (seed 1). The first constructed case for
  «two obstacles → third lane» failed only because it sampled the lane after the crossing, when
  the approach had already brought the ball back to the centre; it now checks at the crossing.
  In the browser: lane-01 with `perfect` 0 impacts and 9 pins, with `sloppy` 2 impacts and
  10 pins; a frame just after lane-01's sweep bar shows the ball beyond the board after its jump.
  `check-boundaries` stopped a pilot test importing `node:fs`; test files may now import `node:`
  built-ins. 1 shot. For the human: impacts cost few pins (sloppy 10 vs perfect 9 on lane-01) —
  see the [headless runs](headless-runs.md) record before judging.
- 2026-10-27 · round 4 · Rule 5: good ignores 0.25 of the obstacles it notices, sloppy 0.70
  (were 0.10 and 0.30); sloppy's notice time stays at the track gate's 0.35 s. Criteria 2 and 3:
  perfect has 0 impacts and the centre lane at the hand-over on every track, sloppy 2.7 impacts a
  run, the same summary twice; tests green. Browser campaign: good 1.0 impacts and 7.3 pins, sloppy
  2.7 and 2.5 ([skills record](../records/skills-20261027.md)). For the human (criterion 5): sloppy
  now misses often enough to look careless rather than unlucky.
- 2026-10-28 · round 5 · Two profiles, `perfect` and `dummy` (a human's decision). Ignoring was
  not enough for a beginner: a dummy that ignored obstacles stayed in the centre lane and hit none
  on lane-03, so it also fixates — it steers towards the lane of an obstacle it ignores — and
  notices at 0.6 s, time enough for two lane changes. Ignore chance tried at 0.3–0.9 with
  `simulateRun`: 0.4 gives 1–4 impacts per track with the track's seed. The dummy's miss
  (0.45–0.6 m, the side of its impacts) comes from the deck sweep of [pins physics](../game/pins.md)
  round 5. Criteria 3 and 5 rewritten and re-locked on the human's authorization. Tests: perfect 0
  impacts and the centre lane on every track; dummy 4, 4, 2, 1, 2 impacts on lane-01…05, the same
  twice; the deck knocks down 3, 5, 7, 7, 7 pins from those hand-overs.
- 2026-10-28 · round 6 · In the browser, three seeds per track: perfect strikes 15 of 15, dummy
  2.7 impacts and 3–7 pins, no strike and no zero
  ([pilot vs blind, 200 m](../records/pilot-vs-blind-200m-20261028.md)). For the human
  (criterion 5): whether target fixation reads as a beginner, and whether a 48 s dummy run on
  lane-01 is too long on stage.
- 2026-10-28 · round 7 · Criterion 4 renamed for the soda cans (they replace the sweep bar) and
  re-locked on the human's authorization; the constructed case jumps them. The dummy's ball now
  reaches the deck at 6 m/s like every ball; the deck still leaves 3, 6, 8, 7, 7 pins from its
  hand-overs on lane-01…05.

## Canonical files

- `createAutopilot(seed)` (`pilot/command-source.ts`) is the session's `CommandSource`; it keeps
  the memory between steps. Changing skill mid-run changes only what is noticed afterwards: an
  obstacle keeps the ignore decision taken when it was noticed.
- The aim at the pocket is `handOffX` (`domain/deck/hand-off.ts`): the pilot's approach brings the
  ball to the centre lane, and the hand-over places it on the pocket plus the aim error.
