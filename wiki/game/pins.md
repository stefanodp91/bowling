---
title: Pins physics — the strike, and the score
type: spec
status: built
depends_on: [game/impacts.md, models/pins.md]
canonical: [game/src/config/pins.ts, game/src/config/physics.ts, game/src/domain/scoring/, game/src/domain/deck/, game/src/app/deck-port.ts, game/src/app/deck-step.ts, game/src/scene/physics/, game/src/scene/views/pins-view.ts, models/src/measures/lane.ts]
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

- The pocket: for a right-hander the ideal entry is board 17½ at the pins, the head pin standing on
  board 20 (counted from the right), i.e. between pins 1 and 3 (bowling coaching references,
  e.g. https://www.bowlingball.com/BowlVersity/the-perfect-strike-pocket; lane geometry from
  https://en.wikipedia.org/wiki/Tenpin_bowling).
- Ball–pin collision models: 2D impulse models with a restitution term (UC Davis BioSport,
  https://research.engineering.ucdavis.edu/biosport/2d-bowling-pin-collisions); rigid-body
  simulations in Blender/Bullet, where the higher friction and lower restitution of the two
  bodies apply (https://research.engineering.ucdavis.edu/biosport/bowling-collision-simulation-using-blender);
  LS-Dyna simulations of ball, ten pins and floor (https://meetings-archive.aps.org/oss/2011/p1/3);
  a 2025 ball-motion model with oil-dependent friction (https://www.bowlinglife.eu/bowling-strike-physics-model).
  None of them gave numeric friction or restitution values to copy: the values in
  `config/physics.ts` are design choices inside the ranges those models use.
- USBC measures lane friction by dragging a ball on a dry lane (patent 8088017,
  https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8088017).

## Rounds

- 2026-10-27 · round 1 · Built the knocked-down rule and deck clock (pure, `domain/scoring/`,
  `domain/deck/`), the hand-over (`handOffX`: the pocket from the centre lane, straight on from
  another lane, plus the impacts' aim error), the session's deck step through a `DeckPort`, and
  the Havok deck (`scene/physics/deck.ts`). Collider: one convex hull of the pin's own lathe mesh,
  shared by the ten bodies — it fills the neck, which never meets the ball or another pin's belly,
  and it is one cheap shape where a compound would need tuning segment by segment. Centre of mass
  0.145 m up. Wrong on the way, found with the Vitest deck harness (NullEngine + Havok WASM read
  from the package): (a) pins created asleep stayed immovable when hit — the ball bounced off them
  → bodies start awake; (b) every pin read as standing because `getAbsolutePosition` returned the
  cached world matrix while physics had moved the nodes → recompute before reading. Then: pocket
  ball at 12 m/s, 10 down; 0.5 m to the side, 1 down; identical twice. In the browser: frames of a
  strike from 488 m (pins scatter and tumble, one stands; score 9) — and pins flew through the
  masking wall and landed on an invisible floor 6 m wide → the colliders now follow what is drawn
  (lane to the deck's end, pit floor, masking wall; nothing beside the lane), the pit measures
  moved into `models/src/measures/lane.ts` so model and colliders share them. After that: pocket
  9 down (a pin rebounds from the wall), side 1, identical twice. 6 shots. The exact counts are in
  the record [deck tests 2026-10-27](../records/deck-tests-20261027.md).

## Canonical files

- The session calls `physics.step()` and `deckStep()` after every world step; the deck's verdict
  turns the run's phase from `deck` to `settling` (first contact) to `result` (judged), and the
  snapshot's `score` is the number of pins down.
- From the hand-over the ball's root belongs to Havok; the ball view stops following the run.
