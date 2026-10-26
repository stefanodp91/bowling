---
title: Shot tool — how an agent looks at its own work
type: spec
status: planned
depends_on: [workspace/monorepo.md, storybook/catalog.md]
canonical: []
verified: 2026-10-26
---

# Shot tool

> Boundary: `npm run shot`, the headless screenshot command. NOT covered: what is judged in the
> image (each model or game page says it), headless pilot runs ([headless runs](../pilot/headless-runs.md)).

## Purpose

Step 5 of [prompt 1](../../prompts/1-self-approval-loop.md) asks the agent to look at the result
«as it really is». This command is its eyes: it renders a story or the running game headlessly and
saves an image the agent then opens.

## Rules

1. `npm run shot -- <target> [--size 1280x720] [--angle <name>]` where `<target>` is
   - `story:<story-id>` → starts (or reuses) Storybook, opens the story's iframe, waits for
     `data-ready="true"`;
   - `game:<query>` → starts (or reuses) the dev server, opens `/?<query>` (for example
     `game:track=lane-01&at=250&pause=1`), waits for the game's ready signal.
2. Uses Playwright with Chromium. Headless WebGL needs a software GL backend: the flags used are
   named constants in the script, with a comment saying why.
3. Output: `shots/<target-slug>-<yyyymmdd-hhmmss>.png` (the folder is git-ignored), and the path
   printed on stdout so the agent can open it.
4. Fails (exit 1) with the browser console errors if the page logs an error or never becomes ready
   within the timeout (a named constant).
5. Every invocation appends one line to `shots/shots.log` (git-ignored): time, target, file. The
   count of shots taken during a round goes in that page's «Rounds» entry.

## Acceptance criteria

1. [auto] `npm run shot -- story:models-placeholder` writes a PNG larger than 10 KB whose centre
   pixel is not the background colour.
2. [auto] `npm run shot -- story:does-not-exist` exits 1 with a message naming the story.
3. [auto] `npm run shot -- game:pause=1` writes a PNG once the game page is built (until then the
   criterion is skipped with a printed notice, not passed silently).

## References

_Filled by the agent (prompt 1, step 2)._

## Rounds

_Filled by the agent (prompt 1, step 5)._
