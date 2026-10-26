# Bowling

A bowling ball rolls by itself down a 500 m lane full of obstacles and ends against ten pins. Nobody
plays: an autopilot drives the ball, and you can only tell it how well to drive.

**The game is the excuse.** This repository shows a way of building software with AI agents: a wiki
that is the specification and that the agent must read before acting, a loop in which the agent
builds, checks and judges its own work one item at a time, automatic gates born from paid errors,
an autopilot that really plays instead of blind tests, and a human who keeps the last word.

## Status

Round zero: the rules, the six procedures and the specification exist; the code does not yet. It
will be written by agents following [`BUILD.md`](BUILD.md). This README is rewritten when the
[release page](wiki/release/open-source.md) is built.

## Where to look

| What | Where |
|---|---|
| The prompt that builds everything | [`BUILD.md`](BUILD.md) |
| The rules every agent follows | [`AGENTS.md`](AGENTS.md) |
| The six procedures, generic (Italian) and instantiated (English) | [`prompts/`](prompts/original-it.md) |
| The specification, in build order | [`wiki/index.md`](wiki/index.md) |
| What waits for a human, and what a human approved | [`wiki/review.md`](wiki/review.md) |

## Licence

[MIT](LICENSE).
