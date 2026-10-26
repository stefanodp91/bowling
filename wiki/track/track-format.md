---
title: Track format — the lane as a JSON file, its bake and its gate
type: spec
status: planned
depends_on: [workspace/monorepo.md, method/gates.md]
canonical: []
verified: 2026-10-26
---

# Track format

> Boundary: what a track file contains, how tracks are generated and validated, and the
> `check-tracks` gate. NOT covered: how obstacles look (`models/obstacles/*`), how the run uses the
> track ([run](../game/run.md)), how the pilot reads it ([autopilot](../pilot/autopilot.md)).

## Purpose

What is where on the lane is data, not code. One JSON file per track is the single source that the
scene draws, the run collides with and the autopilot reads. Same file, same run.

## Rules

1. **Location:** `game/public/tracks/<trackId>.json`, plus `game/public/tracks/index.json` listing
   the track ids in play order. Tracks are committed; the game never generates a track at runtime.
2. **Coordinates:** metres. `z` grows along the lane from the foul line (`z = 0`, where the ball
   starts) to the head pin. `lane` is `0` (left), `1` (centre), `2` (right).
3. **Schema** (`game/src/domain/track/schema.ts`, zod; the TypeScript type is inferred from it):

   ```json
   {
     "schemaVersion": 1,
     "trackId": "lane-01",
     "seed": 1001,
     "lengthM": 500,
     "lanes": 3,
     "obstacles": [
       { "kind": "stray-pins",      "lane": 0, "z": 42 },
       { "kind": "rental-shoes",    "lane": 1, "z": 61 },
       { "kind": "returning-ball",  "lane": 2, "z": 80, "speedMps": 3 },
       { "kind": "sweep-bar",                  "z": 104 },
       { "kind": "widening-gutter", "lane": 2, "z": 130, "lengthM": 18 }
     ]
   }
   ```

   `kind` is a closed union of the five obstacle kinds. `sweep-bar` has no `lane` (it spans all
   three). `returning-ball` requires `speedMps`; `widening-gutter` requires `lengthM`. Lane width,
   ball and pin measures are not in the file: they are constants in `game/src/config/` and
   `models/`, because they never change between tracks.
4. **Loading:** the game reads `?track=<id>` (default: the first id in `index.json`), fetches the
   file and validates it. An invalid file stops the start with a visible error naming the field;
   it never falls back to an empty lane.
5. **Bake:** `npm run bake:tracks` regenerates every track from its seed with a pure generator
   (`game/src/domain/track/generate.ts`, seeded random source injected). Generator rules:
   - no obstacle in the first `START_CLEAR_M` (30 m) or the last `APPROACH_CLEAR_M` (40 m);
   - the gap between consecutive obstacles shrinks linearly from `GAP_START_M` (25 m) to
     `GAP_END_M` (15 m), plus a seeded jitter of ±`GAP_JITTER_M` (2 m);
   - kinds drawn with weights from `config/track.ts`; lanes drawn uniformly among legal ones.
   It ships five tracks, `lane-01` … `lane-05`, seeds `1001` … `1005`. Re-baking with unchanged
   code must produce byte-identical files.
6. **Solvable by construction and by check.** `check-tracks` (a gate, see [gates](../method/gates.md))
   validates every committed file against the schema and against these rules:
   - spacing and clear zones of rule 5;
   - at every `z`, at least one lane is passable: lane obstacles never block all three lanes within
     `PASSABLE_WINDOW_M` (8 m), and a widening gutter's lane counts as blocked over its whole length;
   - a `sweep-bar` has no other obstacle within `SWEEP_BAR_CLEAR_M` (8 m) before or after it, so a
     jump has room to take off and land;
   - there is time to act at the maximum speed: the gap to the previous obstacle, divided by
     `MAX_SPEED_MPS`, is at least the longest manoeuvre time (lane change or jump) plus
     `MIN_REACTION_S` (`config/track.ts`). The [autopilot](../pilot/autopilot.md) page adds a test
     that every skill profile reacts at least `MIN_REACTION_S` ahead, so the track and the pilot
     cannot drift apart.
   All thresholds are imported from `game/src/config/`, not repeated in the gate.

## Acceptance criteria

1. [auto] `npm run bake:tracks` twice in a row leaves `git status` clean on `game/public/tracks/`.
2. [auto] `check-tracks` passes on the five committed tracks.
3. [auto] `check-tracks --selftest` rejects: an obstacle in the approach zone; three lane
   obstacles at the same `z`, one per lane; a sweep bar 3 m after a stray-pins group; a file with an
   unknown `kind`.
4. [auto] Unit tests cover the schema (valid, missing field, wrong kind) and the generator (seeded
   determinism, clear zones, spacing trend).
5. [auto] Loading `?track=does-not-exist` shows an error message, not a running lane (once the game
   pages are built).

## References

_Filled by the agent (prompt 1, step 2)._

## Rounds

_Filled by the agent (prompt 1, step 5)._
