---
title: Headless runs — the tester that never gets tired
type: spec
status: planned
depends_on: [pilot/autopilot.md, game/hud.md, game/camera.md, tools/shot.md]
canonical: []
verified: 2026-10-26
---

# Headless runs

> Boundary: `npm run pilot`, the `check-pilot` gate, the blind-input comparison and the
> verification records they produce. NOT covered: the decision logic ([autopilot](autopilot.md)).

## Purpose

A test that does not really play tells you something false. This tool runs the real game in a real
browser, driven by the autopilot, many times, and writes down numbers instead of impressions.

## Rules

1. `npm run pilot -- [--tracks all|<ids>] [--skill perfect|good|sloppy] [--runs <n>] [--speedup <k>] [--blind]`
   starts (or reuses) the dev server, opens the game headlessly (same browser setup as the
   [shot tool](../tools/shot.md), shared code), and for every run reads `window.__bowling` until
   `result`. Output: one JSON line per run (track, skill, seed, simulated duration, wall duration,
   impacts, speed at hand-over, aim error, pins down, average and worst frame time, peak active
   meshes) and a summary table at the end.
2. `--blind` replaces the autopilot with seeded random commands at random intervals: the «taps
   without looking» baseline. Same build, two verdicts.
3. **`check-pilot`** (a `check:full` gate): runs every committed track with `perfect` and fails if
   any run has an impact, does not reach `result`, logs a console error, exceeds the active-mesh
   budget of `game/src/config/render.ts`, or disagrees with `simulateRun` on impacts. Its
   `--selftest` loads a fixture track with an impossible obstacle (bypassing `check-tracks`) and
   verifies the gate fails.
4. Every measurement campaign is written with [prompt 6](../../prompts/6-verification-record.md)
   as `wiki/records/<topic>-<yyyymmdd>.md`, linked from the page it verifies.

## Acceptance criteria

1. [auto] `npm run check:full` includes `check-pilot` and passes; `check-pilot --selftest` passes.
2. [auto] The browser runs agree with `simulateRun` on impacts for every committed track and every
   profile.
3. [auto] A record `wiki/records/pilot-vs-blind-<date>.md` exists with, for the same commit, 5
   tracks × (`perfect`, `good`, `sloppy`, blind): average impacts and average pins down, and the
   commit it measured.
4. [auto] A record of the deck tests of [pins physics](../game/pins.md) (pocket and off-pocket pins
   down) exists and is linked from that page.

## References

_Filled by the agent (prompt 1, step 2)._

## Rounds

_Filled by the agent (prompt 1, step 5)._
