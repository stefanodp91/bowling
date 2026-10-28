---
title: HUD — start menu, run information, end screen
type: spec
status: built
depends_on: [game/pins.md, pilot/autopilot.md]
canonical: [game/src/config/hud.ts, game/src/ui/, game/src/i18n/, game/src/app/snapshot.ts]
verified: 2026-10-28
---

# HUD

> Boundary: everything drawn over the 3D scene: the start menu, run information, the
> countdown, the end screen, errors, localisation. NOT covered: what the skill profiles do
> ([autopilot](../pilot/autopilot.md)).

## Purpose

The audience must understand what is happening without explanation, and the speaker must be able to
change how well the autopilot drives, live, with one click.

## Rules

1. **Run information** (top): distance `0–200 m` as a progress bar with the number, current speed,
   impacts so far, current track id, and the active skill («Autopilot: Perfect»); a «Pause» button
   at the top right (rule 9).
2. **Start menu** (a human's decision of 2026-10-28; it replaces the in-game skill buttons): a page
   opened without `?track=` shows, over the chosen track with the ball in the bowler's hand, a menu
   with the autopilot's skill — `Perfect` or `Dummy`, each with one line saying what it does — the
   committed tracks of `index.json`, the sound toggle ([sounds](../audio/sounds.md), rule 4), and
   «Start». The run is held at the foul line
   (`waitForStart`, `start()` on the session) until «Start», which is also the gesture that lets
   the browser play sound. Choosing a track loads it under the menu; choosing a skill changes the
   held session in place. The chosen option of each group is highlighted by more than colour (a
   marker and `aria-pressed`). An address that names a track — the tools' shots and headless runs —
   starts at once, with `?skill=` or the default `Perfect`. There are no skill buttons during the
   run.
3. **Countdown** during `ready`: 3-2-1, then «Roll».
4. **End screen** in `result`: the ten-pin diagram (down pins dimmed, standing pins solid, numbered),
   the score `n / 10`, «STRIKE!» when ten, impacts and skill of the run, and «Menu», which opens the
   start menu again on the same track and skill without reloading the page, so the sound the
   audience already hears goes on. It goes back to the menu by itself after `AUTO_MENU_S` (10 s);
   a new run never starts by itself (a human's decision of 2026-10-28).
5. **Errors** (invalid track, physics failing to load) replace the HUD with a readable message and
   a «Retry» button; never a blank screen.
6. **Components:** React function components in `game/src/ui/`, one per file, each with a sibling
   `*.module.css`; no inline styles. State reaches them through one typed store; components do not
   read the scene.
7. **Localisation:** every visible string comes from `game/src/i18n/` (i18next, `en.json`); adding a
   language is adding a file.
8. **Accessibility:** buttons are real `<button>`s with accessible names; text contrast at least
   4.5:1 over the scene (a translucent backing panel); nothing conveys state by colour alone.
9. **Pause** (a human's request of 2026-10-28): the «Pause» button, or Escape, holds the run where
   it is (`hold()` on the session; physics and pins stand still too) and shows a pause screen with
   «Resume», which goes on from there, «Main menu», which leaves the run for the start menu, and
   the sound toggle. There is no pause once the result is shown.

## Acceptance criteria

1. [auto] Component tests (Vitest + Testing Library): in the start menu, choosing `Dummy` and a
   track and pressing «Start» starts that track with that skill; during the run there are no skill
   buttons and the active skill is written at the top; the end screen shows «STRIKE!» only for 10.
2. [auto] A test fails if any `.tsx` under `game/src/ui/` contains a string literal rendered as
   text or a `style=` prop (i18n and styles rules).
3. [auto] `npm run shot -- game:track=lane-01&at=150&pause=1` shows the progress bar and the
   active skill, and no menu; `npm run shot -- game:pause=1` shows the start menu over the lane.
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
- 2026-10-28 · round 5 · The human asked for a start menu to choose the skill and the track, in
  place of the in-game buttons, and for the end of a run to go back to it. Built `ui/menu/StartMenu`
  over the held scene (the session's new `waitForStart` and `start()`; a held frame does not step),
  the active skill in the run information, «Menu» on the end screen and the return to the menu
  after 10 s; a page whose address names a track starts at once, so shots and headless runs are
  unchanged. Criteria 1 and 3 rewritten and re-locked on the human's authorization. Tests: the
  menu starts lane-03 with Dummy; no skill buttons in the run; a held session stays at 0 s of
  `ready` until `start()`. `shot:verify`: the 150 m view has the bar and «Autopilot: Perfect» and
  no menu; `game:pause=1` shows the menu over the lane. A headless walk through the page: Dummy and
  lane-02 chosen, held, Start, 4 impacts and 6 pins in 26.2 s, «Menu» back to a held lane-02 with
  Dummy still chosen, 0 console errors.
- 2026-10-28 · round 6 · The sound toggle moved into the start menu and the pause screen; the
  HUD's top right now holds «Pause» (rule 9; Escape too), which holds the session where it is.
  Tests: the pause button and Escape call pause; the pause screen resumes, goes to the main menu
  and toggles sound; a held running session does not move and goes on after `start()`. A headless
  walk on lane-03: Start, Pause at 25.55 m with the ball still 1.5 s later, Resume, Escape, Main
  menu back to a held lane-03; 0 console errors. Criteria unchanged: a criterion for the pause is
  proposed in «To judge».

## Canonical files

- `ui/hud/Hud.tsx` composes `RunInfo`, `Countdown`, `EndScreen` (with `PinDiagram`) and
  `SkillButtons`; components read `GameSnapshot` through `useSnapshot(session.store)` and change
  only the skill (`session.setSkill`).
- The snapshot carries `resultSkill`, the skill active when the ball was handed to the deck.
- `ui/next-run.ts` builds the next run's query; `ui/ui-rules.test.ts` enforces criterion 2.
