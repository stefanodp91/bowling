---
title: Stray pins — a group of pins left standing in one travel lane
type: spec
status: planned
depends_on: [models/pins.md]
canonical: []
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

_Filled by the agent (prompt 1, step 2)._

## Rounds

_Filled by the agent (prompt 1, step 5)._
