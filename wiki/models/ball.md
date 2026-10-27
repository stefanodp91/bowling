---
title: Ball — the bowling ball the autopilot rolls
type: spec
status: built
depends_on: [storybook/catalog.md, tools/shot.md]
canonical: [models/src/measures/scale.ts, models/src/measures/ball.ts, models/src/ball/, models/src/procedural/, models/src/materials/scene-cache.ts, storybook/src/stories/ball.stories.tsx, storybook/src/stories/ball-house.stories.tsx]
verified: 2026-10-27
---

# Ball

> Boundary: the bowling ball model and its measures, including the house-ball variant used by the
> returning-ball obstacle. NOT covered: how it moves ([run](../game/run.md)), how it hits pins
> ([pins physics](../game/pins.md)).

## Purpose

The protagonist: on screen for the whole run, a few metres from the camera. It must read
immediately as a real bowling ball.

## Rules

1. Measures (`models/src/measures/ball.ts`): a 16 lb ball at the regulation maximum size —
   diameter 0.218 m, mass 7.26 kg — at twice life size ([conventions](conventions.md)): diameter
   0.436 m, mass 58.08 kg; finger-hole layout as researched, scaled the same way.
2. Look: polished reactive-resin cover with a marbled swirl (procedural texture, seeded), strong
   clear-coat reflections; three finger holes (thumb and two fingers) cut into the surface, visible
   as dark recesses, so the rotation is readable while rolling.
3. Variants via options: `variant: 'player' | 'house'`. `player` is a deep blue-violet marble;
   `house` is a plain, slightly scuffed red ball with a printed weight number, for the
   returning-ball obstacle.
4. The model does not spin itself: the run rotates the handle's `spin` node — the ball's centre,
   child of `root` — so that angular speed matches linear speed (`ω = v / r`). (Rotating `root`
   itself would swing the ball around its ground contact point, where conventions put the origin.)

## Acceptance criteria

1. [auto] Stories `models-ball` and `models-ball-house` exist and reach ready.
2. [auto] A unit test measures the generated mesh's bounding box: diameter within ±2 mm of the
   measure.
3. [auto] Finger holes are geometry, not texture: the mesh has at least three concave recesses
   (test on vertex positions below the sphere radius).
4. [human] At default and close-up angles it reads as a bowling ball, not a marble or a planet.

## References

- USBC limits: weight ≤ 16 lb (7.26 kg), diameter 8.500–8.595 in (21.59–21.83 cm), at most five
  gripping holes, one per finger and one for the thumb (https://en.wikipedia.org/wiki/Bowling_ball;
  USBC summary https://images.bowl.com/bowl/media/legacy/internap/bowl/associations/pdfs/BallSpecSummary.pdf;
  Ten-Pin Canada https://tenpincanada.com/home/resources/equipment-specifications/).
- Conventional grip, from drilling practice: thumb hole ≈ 1 in, finger holes ≈ 3/4 in, span ≈ 4¼–4½
  in, bridge ≈ ¼ in between the fingers; values in `measures/ball.ts`.
- Reactive-resin covers show broad smeared swirls («pearl» or «hybrid» marbling) under a high
  polish; house balls are polyester, one plain colour, often scuffed, with the weight engraved near
  the grip (manufacturer product photos, e.g. https://www.stormbowling.com/balls,
  https://www.brunswickbowling.com/bowling-balls — looked at, not downloaded).

## Rounds

- 2026-10-26 · round 1 · Built measures, geometry (a 96-segment sphere whose vertices inside each
  hole are pushed in, shaded dark by vertex colour), generated covers (3D value noise sampled on
  the sphere, so no seam) and the two stories. 14 shots. Wrong, in order: (a) the marble read as a
  contour map — «a planet» — because thin sharp veins drew coastlines → two layers of domain-warped
  noise, broad soft bands; (b) only the thumb hole was visible, the fingers sat on the silhouette →
  the grip is tilted −1.1 rad towards the viewer, baked into the vertices; (c) tilting the mesh with
  a rotation inflated its world bounding box (a rotated AABB): the ball «went» 4 cm under the floor
  and the stage framed it too far → bake instead of rotate; (d) the house ball's weight was printed
  on the hidden side and then mirrored → label beside the grip, columns against u. Now: default
  and close-up show a polished blue-violet ball with three dark holes and ceiling-light
  reflections; the house ball is plain scuffed red with «16» beside the grip. Unit tests:
  diameter within ±2 mm on three axes for both variants, ≥ 3 separate recesses, lowest point at
  y = 0. Stories ready in 2.2 s and 1.6 s.
- 2026-10-27 · round 3 · Twice life size ([conventions](conventions.md)): `measures/ball.ts` keeps
  the regulation 0.218 m and 7.26 kg and exports them × `PROP_SCALE` (0.436 m) and × `PROP_SCALE`³
  (58.08 kg); finger holes and the hole rim scale too. Unit tests unchanged and green (they compare
  with the measure). `measures/scale.ts`, the factor every prop shares, is listed here, the first
  prop in build order. Shots in the game at 140 m and 250 m: the ball reads twice as big against the
  boards, the holes still readable.

## Canonical files

- `createBall(scene, { variant })` returns a `BallHandle`: `root` at the contact point, `spin` at
  the centre. Covers are fixed seeds per variant (`COVER_SEEDS`), so every instance shares one
  material per scene through `perScene` (`models/src/materials/scene-cache.ts`).
- `models/src/procedural/` holds the seeded PRNG (mulberry32), 3D value noise with fBm, and 5×7
  digit glyphs; any model that prints a number uses them.
