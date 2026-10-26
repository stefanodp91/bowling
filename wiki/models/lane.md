---
title: Lane — 500 m of maple, three travel lanes, gutters and pin deck
type: spec
status: built
depends_on: [storybook/catalog.md, tools/shot.md]
canonical: [models/src/measures/lane.ts, models/src/lane/, storybook/src/stories/lane-segment.stories.tsx, storybook/src/stories/pin-deck.stories.tsx, storybook/src/scenes/pin-deck-scene.ts]
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

- Lane 41.5 in (1.054 m) wide, 39 boards; 60 ft (18.29 m) from the foul line to the head pin
  centre; targeting arrows about 15 ft past the foul line; dots about 7 ft past it
  (https://en.wikipedia.org/wiki/Tenpin_bowling; https://www2.hawaii.edu/~ericsk/me/targeting_aids.htm).
- Gutter 9.25 in (0.235 m) wide and 1.875 in (47.6 mm) deep (https://www.dimensions.com/element/bowling-lane).
- Foul line 3/8 in wide; pin spots 2.25 in across, 12 in apart (USBC lane and pin specifications,
  as summarised in the sources above).
- Photos of lanes under alley lighting: honey-coloured maple, a bright glossy streak where the
  ceiling lights reflect on the oil, dark gutters, a light synthetic pin deck under a spot, black
  masking units behind (looked at, not downloaded).

## Rounds

- 2026-10-26 · round 1 · Built measures, a generated maple texture (39 boards per lane, grain
  that wraps along z, darker seam between travel lanes), lacquer as a clear coat, trough gutters,
  markings as flat geometry (foul line, ten dots and seven arrows per travel lane), the pin deck
  factory and two stories. 6 shots. Wrong: (a) gutters and pit invisible — the stage floor sat at
  the lane surface and covered everything below y = 0 → the stage floor now goes under the
  model's lowest point; (b) the side travel lanes stopped at the head pin, leaving holes beside
  the deck → the deck plate spans the three travel lanes and the gutters run on to the pit;
  (c) `Mesh.createInstance` threw «InstancedMesh needs to be imported» (the tree-shaking trap of
  AGENTS.md) → side-effect import in `lane-segment.ts`. Now: close-up shows boards with seams, a
  glossy streak, the darker lane separators, arrows and dots; the deck scene shows pin 1's spot
  nearest the foul line, gutters, pit and masking wall. Unit tests: width 3.632 m (±5 mm),
  length 20 m, lane centres −1.054/0/+1.054, instancing adds no geometry. Rule 5 (fog) belongs to
  the scene: the [camera](../game/camera.md) page sets it.

## Canonical files

- `createLaneSegment(scene, { foulLineZ? })` returns a `LaneSegmentHandle` whose `instantiate`
  places a copy that shares geometry and materials; the first segment uses `foulLineZ: 0`, the last
  `FINAL_FOUL_LINE_Z_M − 480` (the markings of a regulation lane ending at the head pin).
- `createTroughMesh` is the one gutter section, reused by the
  [widening gutter](obstacles/widening-gutter.md).
- `measures/pins.ts` already holds the pin-spot layout (the deck needs it); the
  [pins](pins.md) page owns it.
- Scene stories pass `frame` to `ModelStage` to frame part of a large model.
