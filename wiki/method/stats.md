---
title: Stats — numbers about how the demo was built
type: spec
status: planned
depends_on: [method/wiki-tooling.md, method/gates.md]
canonical: []
verified: 2026-10-26
---

# Stats

> Boundary: `npm run stats`, which reads the repository and reports how it was built. NOT covered:
> the numbers about how the game plays ([headless runs](../pilot/headless-runs.md)).

## Purpose

The method claims things — the agent judges itself, the human approves fewer items than the agent
declares finished, gates catch real errors. These numbers come only from the repository, so anyone
who clones it can recompute them.

## Rules

1. `npm run stats [--md]` prints, from git and the wiki only:
   - spec pages by status (`planned`, `built`, `approved`), and the gap «built by the agent, not yet
     approved by a human»;
   - entries in `review.md` «To judge» and «Approved»;
   - self-approval rounds recorded (entries in every «Rounds» section) and pages that needed more
     than one;
   - commits in total, and per agent and model (from `Co-Authored-By` trailers; commits without one
     count as human);
   - the longest stretch of consecutive agent commits with no gap over `STREAK_GAP_MIN` (30 min),
     with its duration;
   - gates: how many exist, and for each the commit that added it (`git log --diff-filter=A` on
     `scripts/gates/`) — every gate after the starting set is an error that was paid once;
   - shots taken, if `shots/shots.log` exists locally (marked «local, not in git» otherwise).
2. `--md` prints the same as a Markdown table, ready for a slide or the README.
3. Pure functions for every count, tested on a fixture repository built in a temporary folder.

## Acceptance criteria

1. [auto] Unit tests on a fixture repo: trailers counted per model, streak computed across a 29-min
   gap and broken by a 31-min gap, statuses counted from front matter.
2. [auto] `npm run stats -- --md` on this repository exits 0 and prints a table.

## References

_Filled by the agent (prompt 1, step 2)._

## Rounds

_Filled by the agent (prompt 1, step 5)._
