---
title: Headless runs — the tester that never gets tired
type: spec
status: built
depends_on: [pilot/autopilot.md, game/hud.md, game/camera.md, tools/shot.md]
canonical: [scripts/pilot/, scripts/gates/check-pilot.mjs, scripts/headless/, game/src/config/render.ts, game/src/dev/, game/src/pilot/blind.ts]
verified: 2026-10-28
---

# Headless runs

> Boundary: `npm run pilot`, the `check-pilot` gate, the blind-input comparison and the
> verification records they produce. NOT covered: the decision logic ([autopilot](autopilot.md)).

## Purpose

A test that does not really play tells you something false. This tool runs the real game in a real
browser, driven by the autopilot, many times, and writes down numbers instead of impressions.

## Rules

1. `npm run pilot -- [--tracks all|<ids>] [--skill perfect|dummy] [--runs <n>] [--speedup <k>] [--blind]`
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
   tracks × (`perfect`, `dummy`, blind): average impacts and average pins down, and the
   commit it measured.
4. [auto] A record of the deck tests of [pins physics](../game/pins.md) (pocket and off-pocket pins
   down) exists and is linked from that page.

## References

- Playwright `page.route` to replace a response in flight, `waitForFunction` with polling
  (https://playwright.dev/docs/api/class-page).
- Comparing an agent against random play as a baseline is standard in game-AI evaluation
  (random agents in the Arcade Learning Environment, https://arxiv.org/abs/1207.4708).

## Rounds

- 2026-10-27 · round 1 · Built `npm run pilot` (`scripts/pilot/`: one browser run read through
  `window.__bowling`, the Node prediction from `simulateRun`, the campaign and its summary),
  frame statistics for the test hook (`game/src/dev/render-stats.ts`), the snapshot's hand-over
  speed, aim error and seed, the `seed` and `pilot=blind` query parameters, the blind driver, the
  render budget and `check-pilot`. Its selftest replaces `lane-01.json` in flight with stray pins
  across all three lanes; the first time it **passed** — the perfect pilot jumped the pins — which
  exposed that the domain let a jump clear any obstacle lower than the apex (fixed in
  [impacts](../game/impacts.md), round 2). Then the selftest rejects it («perfect hit 1
  obstacle(s)») and the gate passes on the five tracks. The active-mesh budget (250) comes from
  the measured peak (174) with headroom. Campaign: 20 runs, all agree with `simulateRun`, record
  [pilot vs blind 2026-10-27](../records/pilot-vs-blind-20261027.md); the deck tests are in
  [deck tests 2026-10-27](../records/deck-tests-20261027.md). `npm run check:full` passes. What
  the campaign shows about impacts and pins is in [review](../review.md).

- 2026-10-27 · round 2 · New campaign on the 300 m lane, same commands:
  [pilot vs blind, 300 m](../records/pilot-vs-blind-300m-20261027.md) — 20 runs, all reach the
  result, 15 of 15 agree with `simulateRun`; perfect strikes on all five tracks.
- 2026-10-28 · round 3 · Two skills now, `perfect` and `dummy`; criterion 3 rewritten (perfect,
  dummy, blind) and re-locked on the human's authorization. Campaign on the 200 m lane, three seeds
  per track: [pilot vs blind, 200 m](../records/pilot-vs-blind-200m-20261028.md) — perfect 0.0
  impacts and 10.0 pins (15 strikes in 15), dummy 2.7 and 5.5 (no strike, never zero), blind 2.6
  and 3.9; 30 of 30 pilot runs agree with `simulateRun`; 0 console errors. `check:full` passes.
- 2026-10-28 · round 4 · Campaign after the swing, the recovering impacts and the new obstacles:
  [pilot vs blind, swing](../records/pilot-vs-blind-swing-20261028.md) — perfect 0.0 impacts and
  10.0 pins, dummy 2.7 and 5.9 (no strike, no zero), blind 2.2 and 1.7; every run 25.8–26.2 s;
  30 of 30 pilot runs agree with `simulateRun`; `check:full` passes.

## Canonical files

- `scripts/pilot/browser-run.mjs` is shared by the CLI and the gate; it uses the shot tool's
  browser setup (`scripts/headless/`).
- The browser plays the run seed it is given (default the track's seed), so a run and
  `simulateRun(track, skill, seed)` are the same computation until the deck.
