---
title: Shot tool — how an agent looks at its own work
type: spec
status: built
depends_on: [workspace/monorepo.md, storybook/catalog.md]
canonical: [scripts/shot/, scripts/headless/]
verified: 2026-10-28
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

- Headless Chromium has no GPU; WebGL runs on SwiftShader through ANGLE
  (`--use-angle=swiftshader`), and recent Chromium requires `--enable-unsafe-swiftshader` to allow
  that software fallback (https://chromium.googlesource.com/angle/angle/+/HEAD/doc/DevSetup.md,
  https://developer.chrome.com/blog/supercharge-web-ai-testing).
- Playwright `page.screenshot`, `waitForSelector`, `waitForFunction`, `console`/`pageerror` events
  (https://playwright.dev/docs/api/class-page).

## Rounds

- 2026-10-26 · round 1 · Built `shot.mjs`, the shared `scripts/headless/` (browser flags, page
  with error capture, pixel reader, server start/reuse) and `npm run shot:verify`. Shots: 6.
  Results: (1) `story:models-placeholder` → 20 981-byte PNG, centre pixel rgb(183,134,85), not the
  background #1B1D22; (2) `story:does-not-exist` → exit 1, «story «does-not-exist» does not exist
  in the catalogue»; (3) `game:pause=1` → skipped with a printed notice until
  [run](../game/run.md) is built. A story is ready in 1.4 s once Storybook runs.

- 2026-10-27 · round 2 · The game page exists: criterion 3 now runs instead of being skipped —
  `game:pause=1` writes a PNG — and `shot:verify` also checks the run page's 250 m shot (centre
  pixels against the fog colour). First game shot failed with «504 (Outdated Optimize Dep)»: Vite
  re-optimised new dependencies on first load; the retry passed (no change needed).
- 2026-10-28 · round 3 · `shot:verify` checks the run page's shot at 150 m and two skill
  buttons, following the 200 m lane and the two skills.

## Canonical files

- `npm run shot:verify` checks criteria 1–3 here and criterion 2 of the
  [catalogue](../storybook/catalog.md) for every story; each model page runs it after adding its
  story. It starts the servers it needs and stops only those it started.
- File names use the UTC time; `--angle` is passed to the story as `args=angle:<name>`.
- The game's ready signal is `window.__bowling.ready === true` ([run](../game/run.md), rule 8).
- SwiftShader's «GPU stall due to ReadPixels» notes are not errors and are ignored.
