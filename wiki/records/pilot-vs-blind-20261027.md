---
title: Pilot vs blind — 5 tracks, three skills and the blind baseline in the browser
type: record
verified: 2026-10-27
---

# Pilot vs blind — 2026-10-27

> Boundary: the campaign of [headless runs](../pilot/headless-runs.md) criterion 3 and the
> browser/simulation agreement of criterion 2. NOT covered: the deck tests in Node
> ([deck tests](deck-tests-20261027.md)).

## What was measured, where

- Code: commit `c33fca9` («Build headless runs…»).
- Environment: headless Chromium 156 (Playwright 1.64.1, chromium-headless-shell build 1248) with
  WebGL on SwiftShader (software); Vite 7.3.7 dev server; macOS 27.0.1, Apple arm64; Node 26.0.0.
- Commands: `npm run pilot -- --tracks all --skill perfect`, the same with `good` and `sloppy`,
  and `npm run pilot -- --tracks all --blind`. One run per track and mode, seed = the track's seed
  (1001–1005), `speedup=60` (60 fixed steps per rendered frame).
- Each run: from the countdown to the result (deck judged 3 s after the first contact).

## Results

Impacts / pins down, per track and mode:

| Track | perfect impacts / pins | good impacts / pins | sloppy impacts / pins | blind impacts / pins |
|---|---|---|---|---|
| lane-01 | 0 / 9 | 1 / 8 | 2 / 10 | 9 / 0 |
| lane-02 | 0 / 9 | 1 / 10 | 3 / 8 | 14 / 0 |
| lane-03 | 0 / 9 | 0 / 9 | 1 / 10 | 5 / 0 |
| lane-04 | 0 / 9 | 0 / 9 | 3 / 10 | 4 / 9 |
| lane-05 | 0 / 9 | 0 / 9 | 2 / 10 | 9 / 0 |
| **average** | **0.0 / 9.0** | **0.4 / 9.0** | **2.2 / 9.6** | **8.2 / 1.8** |

- All 20 runs reached the result; 0 console errors.
- Browser vs `simulateRun` on impacts: 15 of 15 pilot runs agree (blind has no simulation).
- Rolling time: 56.3 s (perfect, every track), 56.3–56.5 s (good), 56.5–57.0 s (sloppy),
  57.1–59.3 s (blind). Speed at the hand-over: 12 m/s in all 20 runs — an impact's speed loss is
  recovered long before the deck.
- Aim error at the hand-over (m): perfect 0 on every track; good +0.028, +0.037, 0, 0, 0; sloppy
  +0.054, +0.029, −0.017, −0.036, −0.031; blind +0.043, −0.035, −0.073, +0.039, −0.034.
- Peak active meshes: 174 (pilot runs, lane-02), 186 (blind). Average frame time ≈ 97 ms and worst
  1.8–2.2 s: these measure SwiftShader running 60 simulation steps per frame, not the game's frame
  rate on a GPU.

## Reading

The pilot really plays: perfect never hits, sloppy hits 1–3 times per track, blind 4–14 times and
usually finishes in a side lane, where the ball misses the pins (0 pins in 4 of 5 runs). But
impacts do **not** turn into fewer pins for the pilot: sloppy averages 9.6 pins against perfect's
9.0. The perfect pocket hit always leaves pin 8 (same deck, same hand-over, same result), and the
small aim errors of sloppy runs (≤ 5.4 cm) move the ball off that leave as often as they spoil
the hit. This is written in [review](../review.md) «To judge».

## Scope

One seed per track; one browser (headless Chromium on SwiftShader), one machine. Frame-time and
mesh numbers hold only for this software renderer. Not tried: other seeds, real GPUs, other
browsers, the production build.
