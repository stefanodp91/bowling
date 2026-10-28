---
title: Pilot vs blind with the swing and the new obstacles — every run the same length
type: record
verified: 2026-10-28
---

# Pilot vs blind, swing and new obstacles — 2026-10-28

> Boundary: the campaign of [headless runs](../pilot/headless-runs.md) criterion 3 and the
> browser/simulation agreement of criterion 2, after the human's fourth round (the throw as an arm
> swing, impacts that dip and recover, the wet floor sign and the soda cans). NOT covered: the deck
> criteria (their tests are in [pins physics](../game/pins.md)); the previous campaign is
> [pilot vs blind, 200 m](pilot-vs-blind-200m-20261028.md).

## What was measured, where

- Code: commit `a019a66` («Swing the ball in, keep every run the same length, new obstacles»).
  Tracks: 7, 7, 4, 6, 6 obstacles; one row of soda cans (lane-02 at 97 m).
- Environment: headless Chromium 156 (Playwright 1.64.1, WebGL on SwiftShader) on the Vite 7.3.7
  dev server; macOS 27.0.1, Apple arm64; Node 26.0.0.
- Commands: `npm run pilot -- --tracks all --skill perfect --runs 3`, the same with `dummy`, and
  `--blind`; three seeds per track (the track's, 1 and 2), `speedup=60`. 45 runs. Then
  `npm run check:full`.

## Results

Impacts / pins down, three runs per track (seeds: the track's, 1, 2):

| Track | perfect | dummy | blind |
|---|---|---|---|
| lane-01 | 0/10 · 0/10 · 0/10 | 4/3 · 3/3 · 4/4 | 2/1 · 3/1 · 2/1 |
| lane-02 | 0/10 · 0/10 · 0/10 | 4/6 · 3/6 · 4/6 | 4/3 · 3/1 · 2/1 |
| lane-03 | 0/10 · 0/10 · 0/10 | 2/8 · 1/7 · 1/7 | 2/1 · 2/1 · 3/10 |
| lane-04 | 0/10 · 0/10 · 0/10 | 1/6 · 3/5 · 3/5 | 2/1 · 1/1 · 1/1 |
| lane-05 | 0/10 · 0/10 · 0/10 | 2/7 · 3/8 · 3/7 | 1/1 · 3/1 · 2/1 |
| **average** | **0.0 / 10.0** | **2.7 / 5.9** | **2.2 / 1.7** |

- Strikes: perfect 15 of 15, dummy 0 of 15, blind 1 of 15. No run with zero pins; dummy pins 3–8.
- Rolling time: perfect 25.8 s in every run; dummy 25.9–26.2 s; blind 25.9–26.2 s.
- All 45 runs reached the result, 0 console errors; browser and `simulateRun` agree on impacts in
  30 of 30 pilot runs. Peak active meshes 146 (budget 250). `npm run check:full` exits 0.

## Reading

The human's request holds: a beginner's run now lasts as long as a perfect one, within 0.4 s, and
the two still end apart — a strike every time against three to eight pins, never a strike. The
impacts no longer show in the clock; they show in the dip of the ball, the flying obstacle and the
pins.

## Scope

Three seeds per track, one machine, one software renderer (frame times are not meaningful here).
The dummy's side and miss come from the track seed, so every dummy run of a track misses the same
way. The swing is not measured here: its unit tests and a recording cover it
([run](../game/run.md), round 7).
