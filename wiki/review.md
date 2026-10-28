---
title: Review — what waits for a human, and what a human approved
type: concept
verified: 2026-10-26
---

# Review

> Boundary: the human review queue of [prompt 1](../prompts/1-self-approval-loop.md). NOT covered:
> the rules for moving a page between states ([wiki as spec](method/wiki-as-spec.md)).

Agents add entries to «To judge» and «Where to resume». Only a human moves an entry to «Approved»,
with the date.

## Where to resume

- 2026-10-28, later still — A scoreboard over the pins (live screen for the run, the neighbours'
  waiting) and a ball return with coloured balls at the start of the lanes ([lane](models/lane.md)
  rule 6, two new stories). No criterion changed. To look at: the scoreboard's text from a projector.
- 2026-10-28, late — Two reports fixed: the pause now silences the music too
  ([sounds](audio/sounds.md) rule 4), and every room ends in a painted masking unit in its theme
  instead of a grey rectangle ([lane](models/lane.md) rule 6, `models-alley-end-wall`).
- 2026-10-28, night — Each track now has a room of its own ([lane](models/lane.md) rule 6, five
  themes, one story each in the catalogue), the sound toggle lives in the start menu and the pause
  screen, and «Pause» (or Escape) holds the run ([HUD](game/hud.md) rule 9). No criterion changed;
  two are proposed in «To judge». To look at: the five rooms from the back of a room.
- 2026-10-28, evening — The start menu is built ([HUD](game/hud.md) rule 2): skill and track are
  chosen before the run, the in-game skill buttons are gone, and the end screen goes back to the
  menu. HUD criteria 1 and 3 rewritten and re-locked on the human's authorization. To look at: the
  menu from the back of a room (HUD criterion 4).
- 2026-10-28, later — The human's fourth round: impacts dip and recover, so a dummy run lasts as
  long as a perfect one; the throw is an arm swing during the countdown ([run](game/run.md) rule
  3); the wet floor sign and the soda cans replace the stray pins and the sweep bar
  ([wet floor sign](models/obstacles/wet-floor-sign.md), [soda cans](models/obstacles/soda-cans.md)).
  Criteria rewritten and re-locked on the human's authorization. To look at: the swing and the two
  new obstacles from the back of a room.
- 2026-10-28 — The human's third round is built: a 200 m lane ([lane](models/lane.md)), a run
  that is a throw then a drag ([run](game/run.md) rule 3), impacts that cost speed for good
  ([impacts](game/impacts.md)), and two skills, `perfect` and `dummy`
  ([autopilot](pilot/autopilot.md), [HUD](game/hud.md)); the criteria of seven pages were
  rewritten and re-locked on the human's authorization. Measured in
  [pilot vs blind, 200 m](records/pilot-vs-blind-200m-20261028.md): perfect strikes every time in
  25.9 s, dummy leaves 3–7 pins in 29–48 s. `npm run check:full` passes; every page is `built`.
  To look at with eyes: a dummy run from the back of a room (autopilot criterion 5).
- 2026-10-27, third pass — The human's second round of requests is built: props at twice life
  size ([conventions](models/conventions.md)), the alley around the lane ([lane](models/lane.md)
  rule 6), happier music ([sounds](audio/sounds.md) rule 6) and skills that show
  ([impacts](game/impacts.md), [autopilot](pilot/autopilot.md);
  [skills record](records/skills-20261027.md): perfect 10, good 7.3, sloppy 2.5, blind 1.7). Every
  spec page is `built`, none `approved`. For the human, in «To judge»: whether to accept the
  proposed criteria for the alley and the music, and whether sloppy is now too close to blind. To
  look at with eyes and ears: the alley from a projector, the music on speakers, a sloppy run.
- 2026-10-27, later — After the human's review: the lane is 300 m and a clean run lasts 40 s (run
  and camera criteria rewritten and re-locked on the human's authorization), the black canvas on
  WebGPU browsers is fixed (`check-webgl`), and background music plays (sounds rule 6). All 24
  pages are `built` again; `npm run check:full` passes. Next steps are unchanged below, plus a
  decision on the proposed music criterion in «To judge».
- 2026-10-27 — The build session ran [`BUILD.md`](../BUILD.md) to the end: all 24 spec pages are
  `built`, none `approved`; `npm run check:full` passes on a clean clone. No handoff is open. What
  comes next is human work, in this order: (1) decide the two cases in «To judge» below — the
  impacts-to-pins one changes what the demo shows on stage; (2) look at the `[human]` criteria of
  each page, starting with the ones the agent could not judge: the sounds (criterion 3 of
  [sounds](audio/sounds.md), needs speakers), the pilot's mistakes ([autopilot](pilot/autopilot.md)
  criterion 5) and the README walk-through ([release](release/open-source.md) criterion 5); (3)
  approve pages one by one (`status: approved`, `approved_on`, an entry under «Approved»). The
  points each page left for the human are at the end of its latest «Rounds» entry.
- 2026-10-26 — Round zero committed: rules, prompts and every page `planned`. Nothing is built.
  First step: start from [`BUILD.md`](../BUILD.md) with [workspace](workspace/monorepo.md).

## To judge

Each entry: date · page · what the agent built or could not build · why it needs a human · what
the agent recommends.

- 2026-10-28 · [HUD](game/hud.md) rule 9 (pause) and [lane](models/lane.md) rule 6 (themes) · Both
  asked for by the human and built, but no acceptance criterion covers them (only a human writes
  criteria). Recommend: «[auto] a component test: «Pause» and Escape hold the run, «Resume» goes on
  from the same metre, «Main menu» opens the start menu» and «[auto] every committed track has a
  theme of its own, and story `models-alley-segment` has one story per theme that reaches ready;
  [human] each room reads as a different bowling alley and never hides the obstacles».
- 2026-10-28 · [run](game/run.md) criterion 2 · The criterion's explanation in parentheses
  derives ≈ 26 s from «the 0.8 s throw covers 5.3 m»; the throw is now the arm swing during the
  countdown and rolling starts at 10 m/s, so the expected value is `(10 / 6 − 1) / (k · 10)` with
  `k = ln(10 / 6) / 198`, ≈ 25.8 s (measured 25.8 s). The 24–27 s range still holds, so nothing
  fails; only a human edits the criterion. Recommend replacing the parenthesis with the new
  derivation. Also proposed, for the swing (rule 3): «[auto] a unit test: the swing lays the ball
  on the foul line at the release speed when `ready` ends; [human] the entrance reads as a bowler's
  throw».
- 2026-10-27 · [pins physics](game/pins.md) rule 3, [impacts](game/impacts.md) · The rule says
  physics uses «the graphic engine's Havok adapter». The published graphic engine 0.2.3 exports no
  such adapter: its `adapters/havok` module is empty (`dist/adapters/havok/index.d.ts` is
  `export {}`) and no package export reaches it; the engine only declares a `PhysicsBackend` port
  (`setStepRateHz`, `dispose`). Built instead: Babylon's own `HavokPlugin` behind
  `game/src/scene/physics/` (one module, fixed step). Needs a human because the rule names an
  engine feature that does not exist in the pinned release. Recommend: either amend the rule to
  «Babylon's Havok plugin behind `scene/physics/`», or publish the adapter in a new engine release
  and pin it.
- 2026-10-27 · [impacts](game/impacts.md), [pins physics](game/pins.md), [autopilot](pilot/autopilot.md)
  purpose · Built and measured ([pilot vs blind](records/pilot-vs-blind-20261027.md)): with the
  spec's values (speed × 0.75 then recovery at 1.5 m/s², aim error ± 0.04 m per impact), every
  run reaches the deck at 12 m/s and sloppy runs average 9.6 pins against perfect's 9.0 — the
  demo's message «the audience sees impacts turn into fewer pins» does not show. Two causes: the
  speed loss is recovered before the deck, and the perfect pocket hit (a straight ball, no entry
  angle) always leaves pin 8, so small aim errors help as often as they hurt. All automatic
  criteria pass, so this is a design decision, not a failing page. Recommend one of: carry the
  speed loss to the deck (no recovery after the last obstacle, or a lower recovery rate); a larger
  aim error per impact (≈ 0.10–0.15 m reaches the 1–3 or 1–2 «Brooklyn» side and the split
  zone); or an entry angle at the hand-over so the pocket hit strikes. Each changes a value a
  human wrote in a rule or criterion.
  Update after the 300 m lane ([record](records/pilot-vs-blind-300m-20261027.md)): perfect now
  strikes on all five tracks, good averages 9.6 pins and sloppy 9.8, blind 4.0. Impacts cost a
  little, still not enough to be seen from the back of a room; the recommendation stands.
  Update of 2026-10-27: the human asked that the skills differ visibly and authorised the change of
  impacts criterion 2. The spec now carries the speed loss to the pins (0.4 loss, recovery at
  0.5 m/s²), a larger aim error (0.25 m at regulation size) and more ignored obstacles for `good`
  and `sloppy`; the next record measures whether the pins show it. A human closes this entry.
  Update of 2026-10-28: the human replaced the three skills with `perfect` and `dummy`; the dummy
  never strikes and always leaves some pins down
  ([pilot vs blind, 200 m](records/pilot-vs-blind-200m-20261028.md)). A human closes this entry.
- 2026-10-27 · [sounds](audio/sounds.md) rule 6 (music) · The human asked for background music;
  it is built as rule 6, but no acceptance criterion covers it (only a human writes criteria).
  Recommend adding: «[auto] the music loop is produced by `npm run audio:build` and checked by
  `audio:check` like the other sounds; [human] it sits under the effects and loops without an
  audible seam.» The first half already holds (`check-audio` covers `music-alley.wav`).

- 2026-10-27 · [lane](models/lane.md) rule 6 (the alley) · The human asked for scenery around the
  lane; it is specified as rule 6, but no acceptance criterion covers it (only a human writes
  criteria). Recommend adding: «[auto] story `models-alley-segment` exists and reaches ready, and
  `npm run shot -- game:track=lane-01&at=100&pause=1` has no black region above the lane; [human]
  from the chase camera it reads as a cheerful bowling alley, and it never hides the next
  obstacles.»

## Approved

Each entry: date · page · who approved · what they looked at.

- 2026-10-28 · [Sounds](audio/sounds.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Camera](game/camera.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [HUD](game/hud.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Impacts](game/impacts.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Pins physics](game/pins.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Run](game/run.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Gates](method/gates.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Stats](method/stats.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Wiki tooling](method/wiki-tooling.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Ball](models/ball.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Lane](models/lane.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Rental shoes](models/obstacles/rental-shoes.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Returning ball](models/obstacles/returning-ball.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Soda cans](models/obstacles/soda-cans.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Wet floor sign](models/obstacles/wet-floor-sign.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Widening gutter](models/obstacles/widening-gutter.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Pins](models/pins.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Autopilot](pilot/autopilot.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Headless runs](pilot/headless-runs.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Open-source release](release/open-source.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Storybook catalogue](storybook/catalog.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Shot tool](tools/shot.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Track format](track/track-format.md) · Stefano · approved before the talk, 2026-10-28
- 2026-10-28 · [Workspace](workspace/monorepo.md) · Stefano · approved before the talk, 2026-10-28
