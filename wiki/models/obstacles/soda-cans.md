---
title: Soda cans — a row of drink cans spilled across all three travel lanes
type: spec
status: approved
approved_on: 2026-10-28
depends_on: [models/lane.md]
canonical: [models/src/obstacles/soda-cans/, models/src/measures/obstacles.ts, storybook/src/stories/obstacle-soda-cans.stories.tsx, game/src/domain/obstacles/jump-clearance.test.ts]
verified: 2026-10-28
---

# Soda cans

> Boundary: the soda-cans obstacle model and its footprint. NOT covered: what happens on impact
> ([impacts](../../game/impacts.md)), where it goes on a track
> ([track format](../../track/track-format.md)).

## Purpose

The only obstacle that blocks every lane: the pilot must jump, so it is where a mistimed jump
shows. It replaces the pinsetter's sweep bar of the first rounds (a human's decision of
2026-10-28: the sweep was not recognisable, and the human chose drink cans, the alley's bar spilled
on the lane).

## Rules

1. A row of plain red drink cans, a white band round each, aluminium lids, spilled across the whole
   playing surface (three travel lanes and both gutters): most standing, some lying on their side,
   each moved and turned by a seeded amount so rows do not look copied. No brand, no logo (open
   source: [AGENTS.md](../../../AGENTS.md), rule 6). The cans are instances of one can.
2. Measures (`models/src/measures/obstacles.ts`): a 12 fl oz can, 122 mm tall and 66 mm across,
   × `PROP_SCALE` ([conventions](../conventions.md)); the cans stand 0.30 m apart (gaps narrower
   than the ball), as many as fit across the surface.
3. Footprint: the full width; depth = the largest seeded offset plus half a lying can; height = a
   standing can, below the jump apex.
4. Overcome by: jumping only.

## Acceptance criteria

1. [auto] Story `models-obstacle-soda-cans` exists and reaches ready.
2. [auto] A unit test in `game/` checks the footprint's height is below the jump apex of
   `game/src/config/run.ts` (the height of the ball's lowest point at the top of the jump).
3. [human] Reads as drink cans spilled across the lane, not as a fence.

## References

- The standard 12 fl oz beverage can: 4.83 in (122 mm) tall, 2.6 in (66 mm) across the body
  (https://en.wikipedia.org/wiki/Drink_can).

## Rounds

- 2026-10-28 · round 1 · Built one can of three cylinders (red body, white band 1 % proud, a
  tapered aluminium lid) and twelve instances of it, 35 % lying; `sodaCanPlacements(seed)` gives
  the same row for the same seed. An instance keeps its own transform: the first build stacked
  every part at the can's foot until each instance copied its part's position. Unit tests: every
  can inside the footprint along z for five seeds, the row spans the surface, a lying can's band
  sinks under 1 mm into the lane; in `game/`, the footprint (0.244 m) is below the 1 m jump apex.
  Shots: story default and close-up, and lane-02 just before its cans in the game.

## Canonical files

- `SODA_CANS_FOOTPRINT` spans the playing surface; the game places the row at `x = 0`.
