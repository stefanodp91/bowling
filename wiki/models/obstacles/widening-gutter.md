---
title: Widening gutter — the gutter eats one travel lane for a stretch
type: spec
status: built
depends_on: [models/lane.md]
canonical: [models/src/obstacles/widening-gutter/, models/src/lane/board-holes.ts, models/src/measures/obstacles.ts, storybook/src/stories/obstacle-widening-gutter.stories.tsx, storybook/src/scenes/widening-gutter-scene.ts]
verified: 2026-10-26
---

# Widening gutter

> Boundary: the widening-gutter obstacle model. It is terrain, not an object. NOT covered: what
> happens when the ball enters it ([impacts](../../game/impacts.md)).

## Purpose

An obstacle the pilot must see early, because it lasts: one travel lane becomes a gutter channel for
the track's `lengthM`.

## Rules

1. Parametric on `lengthM` and `lane`: over that stretch the boards of that travel lane are replaced
   by a gutter channel (a rounded trough, same section as the outer gutters), with a tapered ramp
   of `GUTTER_RAMP_M` (2 m) at both ends where the channel opens and closes.
2. It fits the lane segment grid: it covers the boards it replaces exactly, with no gap or overlap
   visible from the chase camera.
3. Footprint: the travel lane over `[z, z + lengthM]`.
4. Overcome by: changing lane before it starts.

## Acceptance criteria

1. [auto] Story `models-obstacle-widening-gutter` (length 18 m, centre lane) exists and reaches ready.
2. [auto] A unit test checks the channel spans exactly one travel lane width and `lengthM` plus the
   two ramps.
3. [human] From the chase camera it reads as the gutter widening, with no visible seam.

## References

- Gutter section: 9.25 in wide, 1.875 in deep, a rounded channel along each side of the lane
  (https://www.dimensions.com/element/bowling-lane).
- Babylon material plugins inject GLSL into a PBR material; per-draw values are set in
  `hardBindForSubMesh`, which Babylon calls only for plugins that set `registerForExtraEvents`
  before activation (https://doc.babylonjs.com/features/featuresDeepDive/materials/using/materialPlugins;
  `node_modules/@babylonjs/core/Materials/materialPluginManager.pure.js`).

## Rounds

- 2026-10-26 · round 1 · Built the channel from the lanes' trough section (ramps as a depth
  multiplier along z) and a story that composes two lane segments with an 18 m gutter in the centre
  lane. The channel lies below y = 0, so the boards hid it: a material plugin on the boards now
  discards fragments inside registered world-space rectangles. Two failures on the way, each a
  shot: (a) the plugin was attached after the board shader compiled → it marks the defines dirty;
  (b) the uniform never reached the shader → `registerForExtraEvents` must be set before enabling.
  Then the channel showed but read as a flat grey strip: 48 mm deep over a whole lane is invisible.
  «Same section» means the same shape, so the depth now scales with the width (≈ 0.21 m). 4 shots.
  Now: from a chase-like close-up the centre lane turns into a rounded grey channel, ramping in and
  out, flush with the boards on both sides, no seam. Unit tests: width = one travel lane, length =
  18 m + two 2 m ramps, rim at y = 0, root on the requested lane.

## Canonical files

- `createWideningGutter(scene, { lengthM, lane })`: root on the lane's centre line at the start of
  the full-depth channel (the factory sets x, the scene sets z); the ramps extend 2 m before and
  after. Its footprint is `wideningGutterFootprint(lengthM)`: height 0 (terrain), `centreZM =
  lengthM / 2` because the obstacle starts at its z.
- `openBoardHole(scene, provider)` (`lane/board-holes.ts`) works for any model that must replace
  boards; at most `MAX_BOARD_HOLES` (8) at once.
