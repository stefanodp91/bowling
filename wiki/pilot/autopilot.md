---
title: Autopilot — the only player, and its three skill profiles
type: spec
status: planned
depends_on: [game/impacts.md, game/pins.md]
canonical: []
verified: 2026-10-26
---

# Autopilot

> Boundary: how the autopilot reads the track and decides each command, its skill profiles, and the
> aim at the pins. NOT covered: running it headlessly and measuring it
> ([headless runs](headless-runs.md)), the buttons that switch skill ([HUD](../game/hud.md)).

## Purpose

Nobody plays this demo: the autopilot does, and it really plays — it reads the same track file as
the scene and decides from it, so what it proves about the game is true for the game. Its skill can
be lowered on stage, so the audience sees impacts turn into fewer pins.

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
5. **Skill profiles** (`game/src/config/pilot.ts`, an `as const` record):

   | Profile | Notices an obstacle at a time to meet of | Chance to ignore a noticed obstacle |
   |---|---|---|
   | `perfect` | 1.0 s | 0 |
   | `good` | 0.6 s | 0.10 |
   | `sloppy` | 0.35 s | 0.30 |

   The ignore draw happens once per obstacle, when it is first noticed, from the seeded source
   keyed by the obstacle's index: same track, seed and skill changes → same run. Changing skill
   mid-run affects only obstacles noticed afterwards.
6. **The approach.** After the last obstacle the pilot moves to the centre lane and aims at the
   pocket: `x = POCKET_OFFSET_M` to the right of the head pin (owned by
   [pins physics](../game/pins.md), imported, not redefined). That aim target is what pins physics
   receives, plus the aim error from impacts.
7. **Simulated runs.** `simulateRun(track, skill, seed) → RunSummary` runs the domain (run,
   impacts, pilot) without a browser up to the pin-deck hand-over and returns impacts, speed and
   aim at the hand-over. Tests and tools use it.

## Acceptance criteria

1. [auto] A test: every profile notices obstacles at least `MIN_REACTION_S` ahead (the track gate's
   constant), so tracks and pilot cannot drift apart.
2. [auto] `simulateRun` with `perfect` on every committed track: zero impacts, centre lane at the
   hand-over.
3. [auto] `simulateRun` with `sloppy` on every committed track: at least one impact in total across
   the five tracks, and the same summary when run twice.
4. [auto] Unit tests on constructed cases: a returning ball is avoided even when a still obstacle is
   nearer in distance but later in time; two obstacles in two lanes at the same `z` lead to the third
   lane; a sweep bar leads to a jump that clears it; a widening gutter is left before it starts.
5. [human] Watching `Good` and `Sloppy` runs, the pilot's mistakes look like mistakes, not glitches.

## References

_Filled by the agent (prompt 1, step 2)._

## Rounds

_Filled by the agent (prompt 1, step 5)._
