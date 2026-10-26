---
title: Deck tests — pocket and off-pocket pins down in Havok
type: record
verified: 2026-10-27
---

# Deck tests — 2026-10-27

> Boundary: the three deck-simulation tests of [pins physics](../game/pins.md) (criteria 2–4) and
> the camera's slow-motion test ([camera](../game/camera.md), criterion 2). NOT covered: pins down
> in full browser runs ([headless runs](../pilot/headless-runs.md)).

## What was measured, where

- Code: commit `4b0032c` («Build the pins physics…»).
- Environment: Vitest 3.2.7 in Node 26.0.0 on macOS 27.0.1 (arm64); Babylon.js 9.32.0
  `NullEngine` (no browser, no GPU); Havok 1.3.14 WASM read from the npm package.
- Command: `npx vitest run src/scene/physics/deck.test.ts src/scene/camera/slow-motion.test.ts`
  in `game/`.
- Starting conditions: ten pins standing on their spots; the ball handed over at
  z = 498 m (2 m before the head pin) at 12 m/s, rolling without slipping, no aim error. Physics
  at the simulation step (1/120 s) in 4 substeps. Pins judged 3 s after the first contact.

## Results

| Case | Ball x at hand-over | Pins down | Which | First contact after hand-over |
|---|---|---|---|---|
| Pocket | +0.0676 m (2.5 boards right of the head pin) | **9** | 1, 2, 3, 4, 5, 6, 7, 9, 10 (8 stands) | 0.158 s |
| Off pocket | +0.5 m | **1** | 10 | — |
| Pocket, run twice | +0.0676 m | identical outcome both times | — | — |
| Pocket through the session, 60 Hz frames, no slow motion | +0.0676 m (from z = 497) | 10 | — | — |
| Same, with slow motion (×0.5 for 1.5 s after contact) | +0.0676 m | 10 | — | — |

The pocket count was 10 before the pit floor and masking wall got colliders (same day, previous
commit's work): a pin now rebounds from the wall and stays inside the standing radius.
The session case starts 1 m earlier than the direct deck case, so its hand-over differs by one
step's travel; both are a strike or a near strike.

Criteria: pocket ≥ 8 → **pass** (9); off-pocket fewer than pocket → **pass** (1 < 9); same
inputs, same outcome → **pass**; with and without slow motion, same pins down → **pass**.

## Scope

Holds for this Havok build and these tunables (`game/src/config/physics.ts`,
`game/src/config/pins.ts`) in Node. In the browser the same code runs on the same WASM; one
browser strike from 488 m on lane-01 gave 9 pins (pin 7 standing) — a different hand-over
position, not a comparison. Not tried: other speeds, entry angles, or other physics builds.
