---
title: Wet floor sign — a yellow folding sign standing in one travel lane
type: spec
status: built
depends_on: [models/lane.md]
canonical: [models/src/obstacles/wet-floor-sign/, models/src/measures/obstacles.ts, storybook/src/stories/obstacle-wet-floor-sign.stories.tsx]
verified: 2026-10-28
---

# Wet floor sign

> Boundary: the wet-floor-sign obstacle model and its footprint. NOT covered: what happens on
> impact ([impacts](../../game/impacts.md)), where it goes on a track
> ([track format](../../track/track-format.md)).

## Purpose

The simplest obstacle: something standing in a lane that the pilot avoids by changing lane. It
replaces the stray pins of the first rounds (a human's decision of 2026-10-28: pins belong on the
deck, not on the lane); a sign a cleaner left after mopping is what a real alley would have there.

## Rules

1. A folding A-frame sign, open: two yellow moulded panels hinged at the top, standing on their
   feet in one travel lane, one panel facing the approaching ball. Each panel carries a black band
   at the top and a warning pictogram — a black triangle, yellow inside, with a black exclamation
   mark — built from geometry. No text, no brand.
2. Measures (`models/src/measures/obstacles.ts`): 0.62 m tall, panels 0.30 m wide, feet 0.30 m
   apart, × `PROP_SCALE` ([conventions](../conventions.md)): 1.24 m, above the jump apex.
3. Footprint: the open sign's box, centred in its travel lane; height = the sign's height.
4. Overcome by: changing lane. Jumping over it is not allowed (taller than the jump apex, see
   [run](../../game/run.md)).

## Acceptance criteria

1. [auto] Story `models-obstacle-wet-floor-sign` exists and reaches ready.
2. [auto] A unit test checks the model fits inside its footprint and the footprint fits inside one
   travel lane.
3. [human] Reads as a wet floor sign left on the lane, from the chase camera.

## References

- Folding «caution wet floor» A-frame signs are about 24–25 in (0.61–0.64 m) tall and 11–12 in
  wide, yellow, with a black slipping or warning pictogram
  (https://en.wikipedia.org/wiki/Wet_floor_sign).

## Rounds

- 2026-10-28 · round 1 · Built from two yellow PBR boxes leaning on a shared hinge (each tilted by
  atan(spread / 2 / height)), a black band and a pictogram of two discs with three sides and two
  black boxes on each outer face. A first try turned the back panel the wrong way: Babylon applies
  pitch before yaw, so both panels take the same pitch and the back one is turned half round.
  Unit test: the sign stays inside its footprint (within the panels' 2.4 cm thickness at the
  feet), 1.24 m tall, and the footprint fits one travel lane. Shots: story default and close-up,
  and lane-01 at 25 m in the game.

## Canonical files

- `WET_FLOOR_SIGN_FOOTPRINT` is the open sign's box; `createWetFloorSign` takes no options (every
  sign is the same sign).
