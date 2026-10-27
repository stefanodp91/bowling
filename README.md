# Bowling

A bowling ball rolls by itself down a 500 m lane full of obstacles and ends against ten pins. Nobody
plays: an autopilot reads the lane and drives the ball — it changes lane, jumps the sweep bar,
dodges a house ball rolling back towards it — and you can only tell it how well to drive. Lower its
skill and it starts hitting things; at the end the pins fall in slow motion and the score appears.

![The ball rolling down lane-01, a returning house ball and a pair of rental shoes ahead, the run
information at the top and the three skill buttons at the bottom](docs/screenshot.png)

**The game is the excuse.** This repository shows a way of building software with AI agents: a wiki
that is the specification and that the agent must read before acting, a loop in which the agent
builds, checks and judges its own work one item at a time, automatic gates born from paid errors,
an autopilot that really plays instead of blind tests, and a human who keeps the last word.

## Run it

You need Node.js 22.11 or newer.

```bash
npm ci
```

```bash
npm run dev
```

Open <http://localhost:3000>. The run starts by itself after a countdown. Click a skill button —
**Perfect**, **Good**, **Sloppy** — or press `1`, `2`, `3` to change how well the autopilot drives,
even mid-run. The first click anywhere switches the sound on; the button at the top right mutes it.
When the run ends, **Run again** plays the next track (it also starts by itself after 10 s).

Useful addresses: `?track=lane-03` picks a track (`lane-01` … `lane-05`), `?skill=sloppy` sets the
starting skill.

Other commands:

| Command | What it does |
|---|---|
| `npm run storybook` | The model catalogue on <http://localhost:6006>: every 3D model alone, built from code |
| `npm test` | Unit and component tests, and the type check, in every workspace |
| `npm run check` | Everything the pre-commit hook runs: tests, gates and their self-tests, wiki lint |
| `npm run check:full` | `check` plus the headless gate that plays every track in a real browser |
| `npm run pilot -- --tracks all --skill sloppy` | Plays tracks headlessly; one JSON line per run |
| `npm run build` / `npm run preview` | The static build in `game/dist/`, and a local server for it |

The headless commands (`shot`, `pilot`, `check:full`) use Playwright's Chromium; if it is missing,
install it once with `npx playwright install chromium`.

## How it was built

Every line of code here was written by an AI agent following written procedures, not a chat.

1. **The specification is a wiki.** [`wiki/index.md`](wiki/index.md) lists the pages in build
   order. Each page says what must exist, its rules, and its acceptance criteria — which belong to
   the human and are locked by a hash ([the wiki is the specification](wiki/method/wiki-as-spec.md)).
2. **Six procedures** in [`prompts/`](prompts/) drive the agent: the
   [self-approval loop](prompts/1-self-approval-loop.md), [read before acting](prompts/2-read-before-acting.md),
   [update the documentation](prompts/3-update-docs-after-change.md), [handoff](prompts/4-handoff.md),
   [error → gate](prompts/5-error-to-gate.md), [verification record](prompts/6-verification-record.md).
   The rules every agent follows are in [`AGENTS.md`](AGENTS.md).
3. **The agent judges its own work, a human approves it.** Each page's «Rounds» section says what
   the agent looked at, what was wrong and what changed. Pages go from `planned` to `built` by the
   agent and to `approved` only by a human; what waits for a human is in
   [`wiki/review.md`](wiki/review.md).
4. **Gates** ([list](wiki/method/gates.md)) are automatic checks that block a regression on every
   commit: layer boundaries, magic numbers, solvable tracks, generated sounds, licence notices…
5. **Headless runs** play the real game in a real browser and compare it with a simulation of the
   same rules; the numbers are written down as [verification records](wiki/records/README.md), such
   as [pilot vs blind](wiki/records/pilot-vs-blind-20261027.md).

The story of the build is in [`CHANGELOG.md`](CHANGELOG.md).

## Rebuild it from zero

The first commit, «Round zero», holds only the rules, the procedures and the specification. To watch
an agent rebuild the whole demo, check it out in a fresh folder and start a new agent session with
the prompt in [`BUILD.md`](BUILD.md):

```bash
git checkout 547be39
```

## Numbers

From `npm run stats -- --md`, as of the release commit (run it yourself for the current values):

<!-- stats:start -->
<!-- stats:end -->

## Licence

[MIT](LICENSE). The packages the game ships, with their licences, are listed in
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
