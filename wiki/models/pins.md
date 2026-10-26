---
title: Pins — the ten regulation pins
type: spec
status: built
depends_on: [storybook/catalog.md, tools/shot.md]
canonical: [models/src/measures/pins.ts, models/src/pins/, storybook/src/stories/pin.stories.tsx, storybook/src/scenes/pin-deck-scene.ts]
verified: 2026-10-26
---

# Pins

> Boundary: the pin model, its measures and the ten-pin layout. NOT covered: their physics and the
> knocked-down rule ([pins physics](../game/pins.md)); stray pins as an obstacle reuse this model
> ([stray pins](obstacles/stray-pins.md)).

## Purpose

The goal of every run, seen in close-up during the impact in slow motion. Their shape decides how
they tumble, so it must be the regulation profile.

## Rules

1. Measures (`models/src/measures/pins.ts`): height 0.381 m (15 in); the lathe profile (diameter
   at each height, including the 0.121 m belly and the neck) taken from the regulation
   specification found in step 2 and cited; mass 1.53 kg.
2. Layout: four rows forming a triangle with the head pin (pin 1) nearest to the ball, pin spots
   0.3048 m (12 in) apart centre to centre; standard numbering 1–10 (row 2 is pins 2–3, row 3 is
   4–6, row 4 is 7–10, left to right as seen from the foul line). The layout is a pure function in
   `measures/pins.ts` returning ten positions relative to the head pin spot.
3. Look: glossy white coating, two red neck stripes, a small printed crown logo of our own design
   (no real brand).
4. The factory builds one pin and exposes instancing; the profile is also exported for the physics
   collider (a convex hull or compound shape decided in [pins physics](../game/pins.md)).

## Acceptance criteria

1. [auto] Stories `models-pin` and `scenes-pin-deck` exist and reach ready.
2. [auto] Unit tests: pin height within ±2 mm; maximum diameter within ±2 mm; layout distances
   between neighbouring spots equal 0.3048 m ± 1 mm; pin 1 is the nearest to `z = 0`.
3. [human] Next to the ball at true scale, the pins look like regulation pins.

## References

- Pin: 15 in tall, ≈ 4.75 in at the widest, base ≈ 2.03 in, 3 lb 6 oz – 3 lb 10 oz
  (https://dimensions.com/element/ten-pin-bowling-pin; https://en.wikipedia.org/wiki/Tenpin_bowling;
  height tolerance 14.969–15.031 in in patent US 8,602,906, https://patents.justia.com/patent/8602906).
- The profile table in `measures/pins.ts` (diameter at 16 heights, belly 4.766 in at 4.5 in, neck
  1.797 in at 10 in) is the USBC pin specification as reproduced by equipment references; the
  primary USBC document was not reachable from this session, so the table is the one point a human
  should check against it (see [review](../review.md)). USBC procedures list the measured heights:
  https://bowl.com/equipment-specifications2024/standard-operating-procedures.
- Layout: spots 12 in apart in an equilateral triangle, pin 1 nearest the bowler, rows 2–3, 4–6,
  7–10 numbered left to right from the foul line (Wikipedia «Tenpin bowling»).
- Photos: glossy white coat, two red stripes round the neck, a maker's logo on the upper belly.

## Rounds

- 2026-10-26 · round 1 · Built the profile (Catmull-Rom through the table, a dome over the last
  7 % of the height), a lathe with UVs set from each vertex (u around, v = height / 15 in) so the
  generated coat maps exactly: white, two red neck stripes, a three-pointed crown of our own design.
  `pinSpots()` gives the ten spots. 2 shots: the close-up shows a pin with the regulation belly and
  neck, stripes at the neck, crown below; the deck scene shows the ten pins on their spots, pin 1
  nearest the lane. Unit tests: height and belly within ±2 mm, 18 neighbouring pairs 0.3048 m
  ±1 mm apart, pin 1 nearest to z = 0, rows numbered left to right.

## Canonical files

- `PIN_PROFILE` (height, radius pairs, metres) is exported for the physics collider of
  [pins physics](../game/pins.md); `pinRadiusAt(h)` is the smoothed profile the mesh uses.
- `createPin` returns a `PinHandle` whose `instantiate` places another pin sharing geometry and
  material; the deck scene hides the source pin and places ten instances.
