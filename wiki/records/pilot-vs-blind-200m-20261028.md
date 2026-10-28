---
title: Pilot vs blind on the 200 m lane — perfect, dummy and the blind baseline in the browser
type: record
verified: 2026-10-28
---

# Pilot vs blind, 200 m lane — 2026-10-28

> Boundary: the campaign of [headless runs](../pilot/headless-runs.md) criterion 3 and the
> browser/simulation agreement of criterion 2, after the human's third round (a 200 m lane, a throw
> that slows down, two skills), and the deck sweep the dummy's miss was drawn from. NOT covered:
> the deck criteria themselves (their tests are in [pins physics](../game/pins.md)); the earlier
> campaigns are [skills](skills-20261027.md) and [pilot vs blind, 300 m](pilot-vs-blind-300m-20261027.md).

## What was measured, where

- Code: commit `e95f512` («Shorten the lane to 200 m, throw the ball and let it slow, keep two
  skills»). Tracks baked for 200 m: 7, 7, 4, 6, 6 obstacles.
- Environment: Vitest 3.2.7 with Babylon.js 9.32.0 `NullEngine` and Havok 1.3.14 WASM in Node
  26.0.0 for the deck sweep; headless Chromium 156 (Playwright 1.64.1, WebGL on SwiftShader) on the
  Vite 7.3.7 dev server for the campaign; macOS 27.0.1, Apple arm64.
- Deck sweep: `simulateDeck` (the deck tests' harness) with the ball handed over at the pocket plus
  an offset `d` (left negative), rolling, no other error; a throw-away test, not committed.
- Campaign: `npm run pilot -- --tracks all --skill perfect --runs 3`, the same with `dummy`, and
  `--blind`; three seeds per track (the track's, 1 and 2), `speedup=60`. 45 runs.

## Results

**Where a ball strikes at a beginner's speeds.** Pins down against `d` (m):

| v (m/s) | −1.2 | −1.0 | −0.9 | −0.8 | −0.7 | −0.6 | −0.5 | −0.4 | −0.3 | −0.2 | −0.1 | 0 | +0.1 | +0.2 | +0.3 | +0.4 | +0.5 | +0.6 | +0.7 | +0.8 | +0.9 | +1.0 | +1.2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2.5 | 1 | 3 | 3 | 3 | 5 | 6 | 7 | 6 | 9 | 10 | 8 | 9 | 9 | 6 | 6 | 5 | 4 | 3 | 3 | 3 | 1 | 1 | 0 |
| 4 | 1 | 5 | 3 | 3 | 5 | 7 | 8 | 7 | 10 | 9 | 9 | 10 | 10 | 6 | 7 | 5 | 5 | 3 | 3 | 3 | 1 | 1 | 0 |
| 6 | 1 | 4 | 3 | 3 | 6 | 7 | 8 | 9 | 10 | 10 | 9 | 10 | 9 | 8 | 7 | 6 | 6 | 3 | 5 | 4 | 1 | 1 | 0 |

From 0.3 to 0.8 m right and 0.5 to 0.9 m left of the pocket, a ball leaves 3 to 8 pins at every
speed tried; the dummy's miss, 0.45–0.6 m plus 2–4 cm per impact, falls there.

**Campaign.** Impacts / pins down, three runs per track (seeds: the track's, 1, 2):

| Track | perfect | dummy | blind |
|---|---|---|---|
| lane-01 | 0/10 · 0/10 · 0/10 | 4/3 · 3/3 · 4/3 | 4/1 · 3/9 · 2/1 |
| lane-02 | 0/10 · 0/10 · 0/10 | 4/5 · 3/6 · 4/5 | 3/9 · 3/1 · 5/3 |
| lane-03 | 0/10 · 0/10 · 0/10 | 2/7 · 1/7 · 1/7 | 2/1 · 2/1 · 1/10 |
| lane-04 | 0/10 · 0/10 · 0/10 | 1/7 · 3/5 · 3/5 | 1/1 · 1/10 · 2/1 |
| lane-05 | 0/10 · 0/10 · 0/10 | 2/7 · 3/7 · 3/6 | 4/9 · 3/1 · 3/1 |
| **average** | **0.0 / 10.0** | **2.7 / 5.5** | **2.6 / 3.9** |

- Strikes: perfect 15 of 15, dummy 0 of 15, blind 2 of 15. Dummy runs with no pin down: 0;
  dummy pins 3–7.
- Rolling time: perfect 25.9 s in every run; dummy 29.0–48.5 s (average 36.9 s); blind 30.2–45.8 s.
- Speed at the hand-over: perfect 6.0 m/s; dummy 3.0–4.8 m/s (average 3.5).
- All 45 runs reached the result, 0 console errors; browser and `simulateRun` agree on impacts in
  30 of 30 pilot runs. Peak active meshes 128 (budget 250).

## Reading

The two skills now end at opposite ends and the run shows why: the perfect ball keeps its line and
its speed and strikes; the dummy drifts into obstacles, crawls to the deck at half the speed and
reaches it off the pocket, leaving three to seven pins. A dummy run lasts 10–20 s longer than a
perfect one; the longest, lane-01 with four impacts, is 48.5 s. The blind baseline hits about as
many obstacles as the dummy (2.6 against 2.7) but its pins scatter from 1 to 10, because it reaches
the deck from whatever lane it is in: the dummy's result is a beginner's, steady and never a
strike, not a coin toss.

## Scope

Three seeds per track, one machine, one software renderer (frame times are not meaningful here).
The dummy's side and miss are drawn from the track seed, so every dummy run of a track misses the
same way. Not tried: real GPUs, other release speeds.
