---
title: Rental shoes — a pair of two-tone bowling shoes in one travel lane
type: spec
status: planned
depends_on: [storybook/catalog.md, tools/shot.md]
canonical: [models/src/measures/obstacles.ts, models/src/obstacles/rental-shoes/, storybook/src/stories/obstacle-rental-shoes.stories.tsx, game/src/domain/obstacles/jump-clearance.test.ts]
verified: 2026-10-27
---

# Rental shoes

> Boundary: the rental-shoes obstacle model and its footprint. NOT covered: what happens on impact
> ([impacts](../../game/impacts.md)).

## Purpose

A low obstacle: the pilot can jump it or go around it. It is also the hardest model to build from
code, which makes it the best example of the self-approval loop on stage.

## Rules

1. A pair of classic rental bowling shoes: two-tone leather (three colour zones), laces, a smooth
   sole and a size number printed on the heel. Built from code: a sole outline extruded, an upper
   built from lofted cross-sections, laces as thin tubes.
2. Measures (`models/src/measures/obstacles.ts`): a real shoe is about 0.30 m long and 0.12 m
   high, as researched; in the game twice that ([conventions](../conventions.md)), 0.60 m and
   0.24 m; the two shoes side by side, slightly rotated, in one travel lane.
3. Footprint: the box that contains both shoes; height = shoe height.
4. Overcome by: jumping, or changing lane.

## Acceptance criteria

1. [auto] Story `models-obstacle-rental-shoes` exists and reaches ready.
2. [auto] A unit test in `game/` (the game may import model measures; models may not import the
   game) checks the footprint height is below the jump apex of `game/src/config/run.ts`. Until the
   [run](../../game/run.md) page is built, the test is written and skipped with a reason naming that
   page.
3. [human] At close-up it reads as a pair of rental bowling shoes, not boots or boxes.

## References

- Classic rental shoes: red/blue/grey leather, blucher upper with laces, smooth slide sole and a
  raised heel, the size printed on the back of the heel
  (https://bowling.com/products/classic-mens-rental.htm,
  https://apollo.bowling.com/products/classic-mens-rental-with-straps.htm — looked at, not
  downloaded).
- A men's US 10 fits a ≈ 28 cm foot; the shoe is ≈ 30 cm long and ≈ 11 cm wide (D width).

## Rounds

- 2026-10-26 · round 1 · Built from code: an outline (pure functions of the length fraction t)
  extruded into a sole; an upper lofted from superellipse cross-sections along t, with a collar
  opening cut from the top through which a dark insole shows; three colour zones (blue heel
  counter, grey quarter, red vamp) and grey foxing by vertex colour; criss-crossed laces as
  tubes; the size «10» on the heel from the 5×7 digit glyphs. 2 shots, seen from behind: it read
  as a pair of shoes, but the collar edge was a staircase, the heel label floated off the
  rounded heel, and the camera — like the chase camera — saw only heels.
- 2026-10-26 · round 2 · Finer grid (80 × 44), smaller label set in where the heel is wide enough,
  and the pair turned toes-first towards the approaching ball (yaw ≈ π). 1 shot: red toe caps,
  laces, grey quarters, blue heels, foxing and tan sole; reads as rental bowling shoes, not boots or
  boxes. Left for the human: the toe ends in a slight vertical crease where the sections close.
  Criterion 2's test exists in `game/` and is skipped, naming the [run](../../game/run.md) page.

## Canonical files

- `shoe-shape.ts` (pure profile functions), `shoe-mesh.ts` (sole, insole and upper as one
  vertex-coloured mesh; `mirrored` builds the left shoe), `shoe-details.ts` (laces, heel label),
  `rental-shoes.ts` (materials and the pair).
- `RENTAL_SHOES_FOOTPRINT` in `measures/obstacles.ts` is computed from the two placements: the box
  that contains both rotated shoes, height `RENTAL_SHOE_HEIGHT_M` (0.12 m). A footprint is centred
  on the obstacle's position (travel-lane centre, track `z`).
- `game/` resolves `@models/<path>` to `models/src/<path>` (Vite and Vitest aliases), so the domain
  can import `@models/measures/...`.
