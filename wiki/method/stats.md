---
title: Stats — numbers about how the demo was built
type: spec
status: approved
approved_on: 2026-10-28
depends_on: [method/wiki-tooling.md, method/gates.md]
canonical: [scripts/stats/, scripts/tests/stats.test.mjs]
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

- Git trailers (`Key: value` lines at the end of a message) and `git interpret-trailers`
  (https://git-scm.com/docs/git-interpret-trailers); `Co-authored-by` as GitHub reads it
  (https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors).
- `git log --diff-filter=A` lists the commit that added a path
  (https://git-scm.com/docs/git-log#Documentation/git-log.txt---diff-filterACDMRTUXB82308203).

## Rounds

- 2026-10-26 · round 1 · Built the pure counts, the git/wiki readers and the text and Markdown
  output. Fixture tests (a git repository built in a temporary folder with fixed commit dates)
  pass: two models counted apart and one human commit; a 29-min gap keeps the streak and a
  31-min gap breaks it (3 commits in 58 min); a human commit ends a streak; statuses 1/2/1 read
  from front matter. On this repository `npm run stats -- --md` printed a 15-row table. Checked by
  eye: the round zero commit counts as an agent commit because its message carries a
  `Co-Authored-By` trailer — the rule counts trailers, so that is correct, not a bug.

## Canonical files

- `counts.mjs` holds the pure functions and `STREAK_GAP_MIN`; `read-repo.mjs` reads commits
  (committer date), gates, shots and the wiki; `stats.mjs` assembles rows and prints them.
- A streak counts agent commits in time order; a human commit or a gap over `STREAK_GAP_MIN`
  ends it. The first `Co-Authored-By` trailer names the agent and model.
