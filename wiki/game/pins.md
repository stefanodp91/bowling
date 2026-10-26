---
title: Pins physics — the strike, and the score
type: spec
status: planned
depends_on: [game/impacts.md, models/pins.md]
canonical: []
verified: 2026-10-26
---

# Pins physics

> Boundary: the hand-over of the ball to Havok, the ten pins as rigid bodies, the knocked-down rule
> and the score. NOT covered: the camera and slow motion around the impact ([camera](camera.md)),
> the end screen ([HUD](hud.md)).

## Purpose

The only moment of real physics: whatever happened on the lane decides how the ball arrives, and
Havok decides how many pins fall.

## Rules

1. At `DECK_HANDOFF_Z` the ball becomes a Havok dynamic sphere (ball measures: radius, mass) with
   its current linear velocity along `z`, angular velocity consistent with rolling, and
   `x = aim target + aim error`. The aim target is the pocket, `POCKET_OFFSET_M` to the right of the
   head pin, defined in `game/src/config/pins.ts` with its source; the
   [autopilot](../pilot/autopilot.md) steers towards it once that page is built.
2. The ten pins are Havok dynamic bodies placed on their spots (pins layout), mass from the pin
   measures, collider derived from the pin profile (the choice — convex hull or compound — and its
   reason go in «Rounds»). Friction and restitution values for lane, ball and pins are tunables in
   `game/src/config/physics.ts`, each with the source it was chosen from.
3. Physics uses the graphic engine's Havok adapter and a fixed step; the step and the substeps are
   named constants.
4. **Knocked down:** `SETTLE_S` (3 s) after the first ball–pin contact, a pin counts as down if it
   is tilted more than `DOWN_TILT_DEG` (45°) from vertical or its base moved more than
   `DOWN_SHIFT_M` (half the pin spacing) from its spot. The rule is a pure function in
   `game/src/domain/scoring/`.
5. **Score:** pins down, 0–10. Ten is a strike. One ball per run: no second throw.
6. If no ball–pin contact happens within `SETTLE_S` of the hand-over (a gutter ball), the score is 0.

## Acceptance criteria

1. [auto] Unit tests on the knocked-down rule: upright pin on its spot → standing; tilted 50° →
   down; upright but moved 0.2 m → down.
2. [auto] A deck simulation test (Babylon `NullEngine` + Havok WASM inside Vitest, no browser): a
   ball at the pocket (head pin centre + `POCKET_OFFSET_M`) at 12 m/s with no aim error knocks down
   at least 8 pins (the exact count goes in a verification record).
3. [auto] Same test harness: a ball aimed 0.5 m to the side of the head pin knocks down fewer pins
   than the pocket ball.
4. [auto] Same test harness: two simulations with the same inputs give the same pins down
   (determinism of the fixed step).
5. [human] In slow motion the pins tumble like real pins: they spin, bounce off each other and off
   the deck, nothing passes through anything.

## References

_Filled by the agent (prompt 1, step 2): ball and pin friction and restitution values, typical
strike entry angles and speeds._

## Rounds

_Filled by the agent (prompt 1, step 5)._
