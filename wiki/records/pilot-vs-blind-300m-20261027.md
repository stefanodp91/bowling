---
title: Pilot vs blind on the 300 m lane — three skills and the blind baseline in the browser
type: record
verified: 2026-10-27
---

# Pilot vs blind, 300 m lane — 2026-10-27

> Boundary: the campaign of [headless runs](../pilot/headless-runs.md) criterion 3 and the
> browser/simulation agreement of criterion 2, after the lane became 300 m and the run 40 s. NOT
> covered: the deck tests in Node ([deck tests, 300 m](deck-tests-300m-20261027.md)). The 500 m
> campaign is [pilot vs blind](pilot-vs-blind-20261027.md).

## What was measured, where

- Code: commit `5348ed1` («Shorten the lane to 300 m…»).
- Environment: headless Chromium 156 (Playwright 1.64.1) with WebGL on SwiftShader; Vite 7.3.7
  dev server; macOS 27.0.1, Apple arm64; Node 26.0.0.
- Commands: `npm run pilot -- --tracks all --skill perfect`, the same with `good` and `sloppy`,
  and `npm run pilot -- --tracks all --blind`; one run per track and mode, seed = the track's seed
  (1001–1005), `speedup=60`. Tracks re-baked for 300 m: 12, 12, 9, 12, 11 obstacles.

## Results

Impacts / pins down, per track and mode:

| Track | perfect impacts / pins | good impacts / pins | sloppy impacts / pins | blind impacts / pins |
|---|---|---|---|---|
| lane-01 | 0 / 10 | 1 / 9 | 1 / 9 | 3 / 10 |
| lane-02 | 0 / 10 | 1 / 9 | 2 / 10 | 5 / 0 |
| lane-03 | 0 / 10 | 0 / 10 | 1 / 10 | 2 / 10 |
| lane-04 | 0 / 10 | 0 / 10 | 1 / 10 | 5 / 0 |
| lane-05 | 0 / 10 | 0 / 10 | 1 / 10 | 5 / 0 |
| **average** | **0.0 / 10.0** | **0.4 / 9.6** | **1.2 / 9.8** | **4.0 / 4.0** |

- All 20 runs reached the result; 0 console errors; browser vs `simulateRun` on impacts: 15 of 15
  pilot runs agree.
- Rolling time: perfect 40.0–40.0 s, good 40.0–40.2 s, sloppy 40.1–40.3 s, blind 40.4–41.2 s.
  Speed at the hand-over: 12 m/s in all 20 runs.
- Aim error at the hand-over (m), lane-01 … lane-05: perfect +0.000, +0.000, +0.000, +0.000, +0.000; good +0.028, +0.037, +0.000, +0.000, +0.000;
  sloppy +0.028, +0.021, -0.017, +0.011, -0.017; blind +0.006, +0.002, +0.021, +0.006, +0.061.
- Peak active meshes: 174 (budget 250).

## Reading

The run lasts 40 s as decided. Perfect now strikes on every track, where on the 500 m lane the
same pocket hit left pin 8: the deck sits at a different absolute position, so floating-point
rounding in Havok changes the hit. The outcome of one hit is that sensitive — and in Node, with the
hand-over exactly at 298 m, the same pocket hit still leaves pin 8 ([deck tests, 300 m](deck-tests-300m-20261027.md)).
Impacts now cost a little: good averages 9.6 pins, sloppy 9.8, against perfect's 10; blind ends in
a side lane in 3 of 5 runs and averages 4.0. Still a small difference for a stage demo; see
[review](../review.md) «To judge».

## Scope

One seed per track; one browser (headless Chromium on SwiftShader), one machine. Frame-time and
mesh numbers hold only for this software renderer. Not tried: other seeds, real GPUs, the
production build.
