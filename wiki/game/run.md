---
title: Run — the ball's 500 m, from foul line to pin deck
type: spec
status: planned
depends_on: [track/track-format.md, models/ball.md, models/lane.md]
canonical: []
verified: 2026-10-26
---

# Run

> Boundary: the run as pure domain logic — its states, speed, lane changes, jumps, determinism —
> and the scene that shows it. NOT covered: collisions and their cost ([impacts](impacts.md)), the
> pin physics ([pins physics](pins.md)), who issues commands ([autopilot](../pilot/autopilot.md)).

## Purpose

The heart of the demo: a ball rolling by itself for about a minute, faster and faster, changing lane
and jumping when the autopilot says so.

## Rules

1. **States** (a closed union): `ready` → `rolling` → `deck` → `settling` → `result`. `ready` lasts
   `READY_S` (1.5 s, a countdown on screen) and starts by itself — there is no player input.
   `deck` begins at `DECK_HANDOFF_Z` (2 m before the head pin) where the ball is handed to physics.
2. **Pure step.** `step(state, command, dtS) → state` in `game/src/domain/run/`, with the command
   from the autopilot (`stay | left | right | jump`). The simulation runs at a fixed step
   (`SIM_STEP_S`, 1/120 s); rendering interpolates. No `Date.now`, no `Math.random` in the domain.
3. **Target speed** grows linearly with distance from `START_SPEED_MPS` (6 m/s) at `z = 0` to
   `MAX_SPEED_MPS` (12 m/s) at the start of the approach zone, then stays there. Actual speed moves
   towards the target with at most `ACCEL_MPS2` (1.5 m/s²). A clean run lasts about a minute.
4. **Lane change:** to an adjacent travel lane in `LANE_CHANGE_S` (0.25 s), eased. A command for a
   lane that does not exist is ignored. A second change can start only when the first has ended.
5. **Jump:** a parabola lasting `JUMP_AIRTIME_S` (0.6 s) whose apex lifts the ball's lowest point to
   `JUMP_APEX_M` (0.5 m). No lane change while airborne.
6. **Rolling:** the ball's rotation follows its speed (`ω = v / r`, radius from the ball measures).
7. **Query parameters** (parsed and validated in one module): `track`, `skill` (initial skill),
   `at` (start already at that metre, for shots), `pause=1` (freeze after the first rendered frame,
   for shots), `speedup` (simulation steps per rendered frame, for headless runs: it multiplies the
   number of fixed steps, never their length).
8. **Test hook** (`game/src/dev/`): `window.__bowling` exposes a read-only snapshot (state, `z`,
   speed, lane, impacts, skill, score when known) and a ready signal, so headless tools read the run
   without scraping the screen.
9. All the values above live in `game/src/config/run.ts`, typed and documented.

## Acceptance criteria

1. [auto] Unit tests: speed never exceeds the target; target speed is monotonic in `z`; the same
   command sequence from the same state gives a bit-identical state sequence; a lane change ends
   exactly in the centre of the adjacent lane after `LANE_CHANGE_S`; a jump returns to `y = 0`
   after `JUMP_AIRTIME_S`.
2. [auto] With the command `stay` only, on an empty track, `rolling` lasts between 50 and 65 s of
   simulated time (≈ 56 s expected: 460 m with speed linear in distance from 6 to 12 m/s is
   `460 / 6 · ln 2` ≈ 53 s, plus 38 m at 12 m/s).
3. [auto] `npm run shot -- game:track=lane-01&at=250&pause=1` shows the ball on the lane (the
   centre region of the image is not background).
4. [human] Watching a run, the ball's acceleration, lane changes and jumps feel smooth and readable.

## References

_Filled by the agent (prompt 1, step 2): typical bowling ball speeds, for the record._

## Rounds

_Filled by the agent (prompt 1, step 5)._
