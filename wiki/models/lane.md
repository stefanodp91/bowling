---
title: Lane — 500 m of maple, three travel lanes, gutters and pin deck
type: spec
status: planned
depends_on: [storybook/catalog.md, tools/shot.md]
canonical: []
verified: 2026-10-26
---

# Lane

> Boundary: the lane surface model — boards, markings, outer gutters, pin deck and back wall — and
> its measures. NOT covered: the widening gutter obstacle ([widening gutter](obstacles/widening-gutter.md)),
> the pins ([pins](pins.md)).

## Purpose

The stage of the whole run. It must look like a real bowling lane stretched to 500 m, and stay cheap
to render for its whole length.

## Rules

1. Measures (`models/src/measures/lane.ts`): one travel lane is 1.054 m wide (the regulation lane
   width, 41.5 in) made of 39 boards; the playing surface is three travel lanes side by side, centred
   on `x = 0` (travel-lane centres at −1.054, 0, +1.054 m), 500 m long. Gutters 0.235 m wide run
   along the two outer edges only, so the ball can move between travel lanes.
2. Look: light maple boards with visible grain and seams, glossy oil sheen near the camera;
   the three travel lanes separated by a subtle darker board line. Regulation markings repeated
   along the lane where they make sense: foul line at `z = 0`, dots and targeting arrows near the
   start, and again in the last 20 m before the pin deck.
3. Pin deck at the end of the centre travel lane, with the ten pin spots marked; a dark masking
   wall behind it with a soft spotlight on the deck.
4. Built in segments (`SEGMENT_LENGTH_M`, 20 m) that the scene instances and recycles: the factory
   creates one segment, not 500 m of geometry. The pin deck is a separate factory.
5. Fog or a fade hides where the lane ends in the distance (the distance is a tunable owned by
   [camera](../game/camera.md)).

## Acceptance criteria

1. [auto] Stories `models-lane-segment` and `scenes-pin-deck` exist and reach ready.
2. [auto] A unit test checks the segment's width (three travel lanes + two gutters) within ±5 mm
   and its length equals `SEGMENT_LENGTH_M`.
3. [human] Seen from the chase camera, it reads as a polished bowling lane, not a wooden floor.

## References

_Filled by the agent (prompt 1, step 2): lane width and board count, arrow and dot positions,
gutter dimensions, pin deck layout, photos of lanes under bowling-alley lighting._

## Rounds

_Filled by the agent (prompt 1, step 5)._
