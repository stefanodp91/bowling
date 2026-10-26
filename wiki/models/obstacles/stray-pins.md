---
title: Stray pins — a group of pins left standing in one travel lane
type: spec
status: built
depends_on: [models/pins.md]
canonical: [models/src/obstacles/stray-pins/, models/src/measures/obstacles.ts, storybook/src/stories/obstacle-stray-pins.stories.tsx]
verified: 2026-10-26
---

# Stray pins

> Boundary: the stray-pins obstacle model and its footprint. NOT covered: the pin itself
> ([pins](../pins.md)), what happens on impact ([impacts](../../game/impacts.md)).

## Purpose

The simplest obstacle: something standing in a lane that the pilot avoids by changing lane.

## Rules

1. Three regulation pins (the [pins](../pins.md) model, instanced) standing in a small triangle,
   centred in one travel lane; a seeded small rotation and offset per pin so groups do not look
   copied.
2. Footprint (`models/src/measures/obstacles.ts`): the box that contains the three pins, used for
   collisions; height = pin height.
3. Overcome by: changing lane. Jumping over it is not allowed (taller than the jump clearance
   margin, see [run](../../game/run.md)).

## Acceptance criteria

1. [auto] Story `models-obstacle-stray-pins` exists and reaches ready.
2. [auto] A unit test checks the footprint contains every pin's base circle and fits inside one
   travel lane.
3. [human] Reads as pins left on the lane, not as the pin deck.

## References

- The [pins](../pins.md) page's references (pin measures, look). Left-over pins after a first ball
  stand apart and irregularly turned, never in the deck's tight 12 in grid with matching logos.

## Rounds

- 2026-10-26 · round 1 · Built three instanced pins on a 0.22 m triangle, each moved by a seeded
  ±3 cm and turned by a seeded yaw (`strayPinPlacements(seed)`). 2 shots: the group reads as pins
  left on the lane, but one pin showed a thin red vertical line — the pin coat's UV seam (an angle
  based u jumps from 1 to 0 across one column of triangles, squeezing the whole texture into it).
  Fixed in the [pin](../pins.md) model: u now comes from the lathe column and the texture wraps.
  3 more shots: no seam; the three crowns face three different ways, so groups do not look copied.
  Unit tests: for five seeds every base circle is inside the footprint; the footprint (box out to
  the belly at full jitter) fits in one travel lane; the same seed gives the same group.

## Canonical files

- `STRAY_PINS_FOOTPRINT` reaches the belly of each pin at its largest jitter, so it contains the
  base circles with margin; height = pin height (0.381 m), above any jump clearance.
