# Changelog

The story of the build, newest first. Conclusions that stay true live in the [wiki](wiki/index.md);
this file keeps what was done and when. Every page was built and closed inside one session, so no
handoff was opened ([`handoffs/`](handoffs/README.md)); each entry points to the page whose
«Rounds» section holds the details.

## Build session — 2026-10-26 / 2026-10-27

One agent session (Claude Opus 5.5) ran [`BUILD.md`](BUILD.md) from round zero, one page at a
time, a commit per finished step.

- **[Open-source release](wiki/release/open-source.md)** — README with a generated screenshot,
  third-party notices generated from the lockfile with the `check-notices` gate, static build and
  preview; the headless pilot passes against the build.
- **[Headless runs](wiki/pilot/headless-runs.md)** — `npm run pilot`, the blind baseline and the
  `check-pilot` gate; its selftest exposed that stray pins could be jumped. Campaign recorded:
  impacts barely cost pins, written in «To judge».
- **[Sounds](wiki/audio/sounds.md)** — rumble, thud, clacks and strike synthesised from numbers;
  `check-audio`; playback through the audio engine, which decodes only after a gesture.
- **[HUD](wiki/game/hud.md)** — run information, skill buttons and keys, countdown, end screen with
  the pin diagram, loading and error screens; a test keeps strings in i18n and styles in CSS.
- **[Autopilot](wiki/pilot/autopilot.md)** — decisions by simulating the short future with the
  run's own step; perfect clears every track; `simulateRun` without a browser.
- **[Pins physics](wiki/game/pins.md)** — Havok deck, knocked-down rule, score; the graphic engine
  has no Havok adapter (in «To judge»). Deck tests recorded.
- **[Impacts](wiki/game/impacts.md)** — collisions in the domain, speed and aim cost, a Havok
  knock-away for show.
- **[Camera](wiki/game/camera.md)** — damped chase, impact side view, slow motion that leaves the
  physics unchanged.
- **[Run](wiki/game/run.md)** — pure fixed-step simulation, session, scene, test hook.
- **[Track format](wiki/track/track-format.md)** — five seeded tracks, zod schema, `check-tracks`.
- **Models** — [ball](wiki/models/ball.md), [lane](wiki/models/lane.md),
  [rental shoes](wiki/models/obstacles/rental-shoes.md), [returning ball](wiki/models/obstacles/returning-ball.md),
  [sweep bar](wiki/models/obstacles/sweep-bar.md), [widening gutter](wiki/models/obstacles/widening-gutter.md),
  [pins](wiki/models/pins.md), [stray pins](wiki/models/obstacles/stray-pins.md): all built from
  code, each judged from shots of its Storybook story.
- **Tooling** — [workspace](wiki/workspace/monorepo.md), [gates](wiki/method/gates.md),
  [wiki tooling](wiki/method/wiki-tooling.md), [stats](wiki/method/stats.md),
  [Storybook catalogue](wiki/storybook/catalog.md), [shot tool](wiki/tools/shot.md).

## Round zero — 2026-10-26

Written by hand before any code, because the six procedures need a documentation to read before
they can run: the rules for agents (`AGENTS.md`, `CLAUDE.md` and the read-before-acting hook), the
six procedures in their original Italian and instantiated for this repository (`prompts/`), the
specification as a wiki with every page `planned` (`wiki/`), the review queue, and the entry prompt
(`BUILD.md`).
