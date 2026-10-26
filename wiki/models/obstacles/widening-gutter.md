---
title: Widening gutter — the gutter eats one travel lane for a stretch
type: spec
status: planned
depends_on: [models/lane.md]
canonical: []
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

_Filled by the agent (prompt 1, step 2): gutter cross-section and dimensions._

## Rounds

_Filled by the agent (prompt 1, step 5)._
