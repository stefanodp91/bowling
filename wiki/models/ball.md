---
title: Ball — the bowling ball the autopilot rolls
type: spec
status: planned
depends_on: [storybook/catalog.md, tools/shot.md]
canonical: []
verified: 2026-10-26
---

# Ball

> Boundary: the bowling ball model and its measures, including the house-ball variant used by the
> returning-ball obstacle. NOT covered: how it moves ([run](../game/run.md)), how it hits pins
> ([pins physics](../game/pins.md)).

## Purpose

The protagonist: on screen for the whole run, a few metres from the camera. It must read
immediately as a real bowling ball.

## Rules

1. Measures (`models/src/measures/ball.ts`): diameter 0.218 m and mass 7.26 kg (a 16 lb ball at the
   regulation maximum size); finger-hole layout as researched.
2. Look: polished reactive-resin cover with a marbled swirl (procedural texture, seeded), strong
   clear-coat reflections; three finger holes (thumb and two fingers) cut into the surface, visible
   as dark recesses, so the rotation is readable while rolling.
3. Variants via options: `variant: 'player' | 'house'`. `player` is a deep blue-violet marble;
   `house` is a plain, slightly scuffed red ball with a printed weight number, for the
   returning-ball obstacle.
4. The model does not spin itself: the run rotates `root` so that angular speed matches linear speed
   (`ω = v / r`).

## Acceptance criteria

1. [auto] Stories `models-ball` and `models-ball-house` exist and reach ready.
2. [auto] A unit test measures the generated mesh's bounding box: diameter within ±2 mm of the
   measure.
3. [auto] Finger holes are geometry, not texture: the mesh has at least three concave recesses
   (test on vertex positions below the sphere radius).
4. [human] At default and close-up angles it reads as a bowling ball, not a marble or a planet.

## References

_Filled by the agent (prompt 1, step 2): regulation size and weight, finger-hole layouts, photos of
reactive-resin covers._

## Rounds

_Filled by the agent (prompt 1, step 5)._
