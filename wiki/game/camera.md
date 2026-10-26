---
title: Camera — chase, impact view and slow motion
type: spec
status: planned
depends_on: [game/run.md]
canonical: []
verified: 2026-10-26
---

# Camera

> Boundary: the cameras, their switch and the slow motion around the strike; the draw distance.
> NOT covered: what the HUD shows ([HUD](hud.md)).

## Purpose

Make a one-minute run that nobody plays watchable from a projector at the back of a room.

## Rules

1. **Chase camera** while `rolling`: `CHASE_BEHIND_M` (3 m) behind and `CHASE_HEIGHT_M` (1.2 m)
   above the ball, looking `CHASE_LOOK_AHEAD_M` (6 m) ahead; it follows lane changes with damping
   (`CHASE_DAMPING_S`) and does not follow the jump fully (`CHASE_JUMP_FOLLOW`, a fraction), so the
   jump reads as a jump.
2. **Impact camera** from `IMPACT_CAMERA_Z` (10 m before the head pin): a smooth blend to a low side
   view of the pin deck, which stays until `result`.
3. **Slow motion:** from the first ball–pin contact for `SLOWMO_S` (1.5 s of simulated time), time
   scale `SLOWMO_SCALE` (0.5). Slow motion stretches how many rendered frames a fixed step covers;
   it never changes the physics step (determinism of [pins physics](pins.md)).
4. **Draw distance:** fog from `FOG_START_M` to `FOG_END_M` ahead of the camera, matching the lane
   segment recycling of the [lane](../models/lane.md).
5. Values in `game/src/config/camera.ts`.

## Acceptance criteria

1. [auto] Unit test: the camera rig is a pure function of the run snapshot (same snapshot, same
   pose), tested at `z` 0, 250 and in the impact zone.
2. [auto] A deck simulation with and without slow motion gives the same pins down.
3. [auto] `npm run shot -- game:track=lane-01&at=495&pause=1` frames the pin deck from the side.
4. [human] From a projector, the ball, the next obstacles and the pins are always readable.

## References

_Filled by the agent (prompt 1, step 2)._

## Rounds

_Filled by the agent (prompt 1, step 5)._
