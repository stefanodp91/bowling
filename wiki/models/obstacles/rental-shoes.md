---
title: Rental shoes — a pair of two-tone bowling shoes in one travel lane
type: spec
status: planned
depends_on: [storybook/catalog.md, tools/shot.md]
canonical: []
verified: 2026-10-26
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
2. Measures (`models/src/measures/obstacles.ts`): about 0.30 m long and 0.12 m high per shoe, as
   researched; the two shoes side by side, slightly rotated, in one travel lane.
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

_Filled by the agent (prompt 1, step 2): shoe dimensions, the typical colour blocking of rental
shoes, photos._

## Rounds

_Filled by the agent (prompt 1, step 5)._
