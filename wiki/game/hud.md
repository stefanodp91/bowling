---
title: HUD — run information, skill buttons, end screen
type: spec
status: planned
depends_on: [game/pins.md, pilot/autopilot.md]
canonical: []
verified: 2026-10-26
---

# HUD

> Boundary: everything drawn over the 3D scene: run information, the three skill buttons, the
> countdown, the end screen, errors, localisation. NOT covered: what the skill profiles do
> ([autopilot](../pilot/autopilot.md)).

## Purpose

The audience must understand what is happening without explanation, and the speaker must be able to
change how well the autopilot drives, live, with one click.

## Rules

1. **Run information** (top): distance `0–500 m` as a progress bar with the number, current speed,
   impacts so far, current track id.
2. **Skill buttons** (always visible, bottom): `Perfect`, `Good`, `Sloppy`. One is active (default
   `Good`, or `?skill=`). Clicking one switches the autopilot's skill immediately, even mid-run;
   the active one is highlighted by more than colour (a marker and `aria-pressed`). Keyboard: `1`,
   `2`, `3`. The skill active at the hand-over to the pin deck is the one reported at the end.
3. **Countdown** during `ready`: 3-2-1, then «Roll».
4. **End screen** in `result`: the ten-pin diagram (down pins dimmed, standing pins solid, numbered),
   the score `n / 10`, «STRIKE!» when ten, impacts and skill of the run, and «Run again», which
   starts the next track of `index.json` (wrapping around). It also starts by itself after
   `AUTO_RESTART_S` (10 s), so the demo can loop unattended on stage.
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

1. [auto] Component tests (Vitest + Testing Library): clicking `Sloppy` mid-run dispatches the
   skill change and marks it pressed; keys `1`–`3` do the same; the end screen shows «STRIKE!»
   only for 10.
2. [auto] A test fails if any `.tsx` under `game/src/ui/` contains a string literal rendered as
   text or a `style=` prop (i18n and styles rules).
3. [auto] `npm run shot -- game:track=lane-01&at=250&pause=1` shows the progress bar and the three
   buttons.
4. [human] From the back of a room, the score and the active skill are readable.

## References

_Filled by the agent (prompt 1, step 2): bowling score-display conventions, pin diagram layouts._

## Rounds

_Filled by the agent (prompt 1, step 5)._
