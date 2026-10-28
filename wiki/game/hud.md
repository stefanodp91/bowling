---
title: HUD — run information, skill buttons, end screen
type: spec
status: built
depends_on: [game/pins.md, pilot/autopilot.md]
canonical: [game/src/config/hud.ts, game/src/ui/, game/src/i18n/, game/src/app/snapshot.ts]
verified: 2026-10-28
---

# HUD

> Boundary: everything drawn over the 3D scene: run information, the two skill buttons, the
> countdown, the end screen, errors, localisation. NOT covered: what the skill profiles do
> ([autopilot](../pilot/autopilot.md)).

## Purpose

The audience must understand what is happening without explanation, and the speaker must be able to
change how well the autopilot drives, live, with one click.

## Rules

1. **Run information** (top): distance `0–200 m` as a progress bar with the number, current speed,
   impacts so far, current track id.
2. **Skill buttons** (always visible, bottom): `Perfect`, `Dummy` (a human's decision of
   2026-10-28: a perfect game against a beginner; there were three). One is active (default
   `Perfect`, or `?skill=`). Clicking one switches the autopilot's skill immediately, even mid-run;
   the active one is highlighted by more than colour (a marker and `aria-pressed`). Keyboard: `1`,
   `2`. The skill active at the hand-over to the pin deck is the one reported at the end.
3. **Countdown** during `ready`: 3-2-1, then «Roll».
4. **End screen** in `result`: the ten-pin diagram (down pins dimmed, standing pins solid, numbered),
   the score `n / 10`, «STRIKE!» when ten, impacts and skill of the run, and «Run again», which
   starts the next track of `index.json` (wrapping around) without reloading the page, so the sound
   the audience already hears goes on. It also starts by itself after `AUTO_RESTART_S` (10 s), so
   the demo can loop unattended on stage.
5. **Errors** (invalid track, physics failing to load) replace the HUD with a readable message and
   a «Retry» button; never a blank screen.
6. **Components:** React function components in `game/src/ui/`, one per file, each with a sibling
   `*.module.css`; no inline styles. State reaches them through one typed store; components do not
   read the scene.
7. **Localisation:** every visible string comes from `game/src/i18n/` (i18next, `en.json`); adding a
   language is adding a file.
8. **Accessibility:** buttons are real `<button>`s with accessible names; text contrast at least
   4.5:1 over the scene (a translucent backing panel); nothing conveys state by colour alone.

## Acceptance criteria

1. [auto] Component tests (Vitest + Testing Library): clicking `Dummy` mid-run dispatches the
   skill change and marks it pressed; keys `1`–`2` do the same; the end screen shows «STRIKE!»
   only for 10.
2. [auto] A test fails if any `.tsx` under `game/src/ui/` contains a string literal rendered as
   text or a `style=` prop (i18n and styles rules).
3. [auto] `npm run shot -- game:track=lane-01&at=150&pause=1` shows the progress bar and the two
   buttons.
4. [human] From the back of a room, the score and the active skill are readable.

## References

- Scoreboards draw the pins as a triangle seen from the bowler — 7-8-9-10 on top, the head pin at
  the bottom — standing pins filled, fallen ones empty or dimmed
  (https://en.wikipedia.org/wiki/Ten-pin_bowling#Scoring and alley scoring screens).
- WCAG 2.2: text contrast at least 4.5:1 (1.4.3) and no information by colour alone (1.4.1)
  (https://www.w3.org/TR/WCAG22/); `aria-pressed` for toggle buttons
  (https://www.w3.org/WAI/ARIA/apg/patterns/button/).
- React `useSyncExternalStore` to read an external store (https://react.dev/reference/react/useSyncExternalStore).

## Rounds

- 2026-10-27 · round 1 · Built the HUD from one store: run information (a native `<progress>` —
  the first draft set a width through a ref to dodge the no-`style=` rule, which is the rule's
  intent broken, so it was replaced), skill buttons with `aria-pressed`, a filled background, a
  thicker border and a marker above the active one, keys 1–3; a 3-2-1 countdown over the ready
  phase and «Roll» over the first 5 m (metres, so `?at=` shots show no banner); the end screen
  with a scoreboard pin diagram (standing solid, down hollow and dashed), «n / 10», «STRIKE!» only
  for ten, impacts, the skill at the hand-over, «Run again» to the next track of `index.json`
  keeping the skill, and a 10 s auto restart; a loading screen. Every string from `en.json`;
  panels are near-black at 78–86 % opacity under near-white text. 2 shots plus a browser probe:
  at 250 m the bar, numbers and buttons read clearly; the end screen shows 9 / 10 with pin 8
  standing; key «1» switched to Perfect; «Run again» opened `?track=lane-02&skill=perfect`.
  Tests: component tests (click Sloppy, keys 1–3, progress value, STRIKE! only for ten) and the
  UI-rules test (no literal text, no `style=`, with its own rejection cases). `shot:verify` checks
  criterion 3 (progress bar and three skill buttons visible).

- 2026-10-27 · round 2 · The bar reads 0–300 m (it reads `LANE_LENGTH_M`, no code change). Running
  `shot:verify` for the 300 m lane showed its HUD check counting four `aria-pressed` buttons: the
  sound toggle (added by the sounds page) uses the attribute too, and the check had never run since.
  It now counts the buttons of the «Autopilot skill» group: three, pass.

- 2026-10-27 · round 3 · «Run again» (and the 10 s auto restart) now starts the next track in the
  same page — new session, new scene (`GameCanvas` keyed by the run), the URL updated with
  `history.replaceState` — instead of reloading it, which had silenced the sound (rule 4, reported
  by the human). Havok is loaded once per page. Checked headlessly: after «Run again» the page is
  the same, lane-02 runs, sound stays on.
- 2026-10-28 · round 4 · Two skill buttons, `Perfect` and `Dummy`, keys 1–2, default `Perfect`
  (a human's decision); criteria 1 and 3 rewritten and re-locked on the human's authorization. The
  bar reads 0–200 m. Component tests green; `shot:verify` counts two buttons at 150 m.

## Canonical files

- `ui/hud/Hud.tsx` composes `RunInfo`, `Countdown`, `EndScreen` (with `PinDiagram`) and
  `SkillButtons`; components read `GameSnapshot` through `useSnapshot(session.store)` and change
  only the skill (`session.setSkill`).
- The snapshot carries `resultSkill`, the skill active when the ball was handed to the deck.
- `ui/next-run.ts` builds the next run's query; `ui/ui-rules.test.ts` enforces criterion 2.
