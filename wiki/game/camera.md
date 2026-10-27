---
title: Camera — chase, impact view and slow motion
type: spec
status: built
depends_on: [game/run.md]
canonical: [game/src/config/camera.ts, game/src/scene/camera/, game/src/scene/mountGame.ts, game/src/app/frame-steps.ts]
verified: 2026-10-27
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
2. **Impact camera** from `IMPACT_CAMERA_Z` (10 m before the head pin, 290 m): a smooth blend to a low side
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
3. [auto] `npm run shot -- game:track=lane-01&at=295&pause=1` frames the pin deck from the side.
4. [human] From a projector, the ball, the next obstacles and the pins are always readable.

## References

- Chase cameras follow position with a lag and frame what lies ahead (e.g. «Look-ahead» and
  damping in third-person cameras, https://www.gamedeveloper.com/design/the-theory-behind-camera-controls-for-3rd-person-games
  — read for the idea, no code).
- Slow motion that stays deterministic changes how much real time each fixed step covers, never
  the step («Fix your timestep», https://gafferongames.com/post/fix_your_timestep/).

## Rounds

- 2026-10-27 · round 1 · Built `scene/camera/rig.ts` — a pure function of the run: chase pose
  (3 m behind, 1.2 m up, 6 m look-ahead, 35 % of a jump), lateral damping computed from the run's
  `lastLaneChange` (its clock keeps running after the change, so damping needs no hidden state),
  smooth blend over 4 m from 490 m to a low side view of the deck; `timeScaleAt` gives the slow
  motion, and the frame clock already accepts a time scale. Field of view 0.9 → 0.75 rad: at 0.9
  the ball was a 50-pixel dot. The game scene had no pins — added a static pins view (the
  [pins physics](pins.md) page drives it). 3 shots: at 120 m the ball is larger and the lane reads
  to the fog; at 495 m the deck is framed from the right with the ten pins standing. Unit tests:
  same input same pose at z 0, 250, 495; chase offsets; lateral follow lags and arrives; partial
  jump follow; impact pose from the impact zone; slow motion only for 1.5 s after contact.
  Not closed: criterion 2 needs the deck simulation of [pins physics](pins.md).
- 2026-10-27 · round 2 · With the deck built, criterion 2 runs as a test
  (`scene/camera/slow-motion.test.ts`): the same deck through the session at 60 Hz frames, once at
  time scale 1 and once with `timeScaleAt` — 10 pins down in both, in 195 and 285 frames. Physics
  advances once per simulation step, so slow motion only changes how many frames the steps take.
  The game applies `timeScaleAt(deck.sinceContactS)` to every frame. Record:
  [deck tests 2026-10-27](../records/deck-tests-20261027.md).
