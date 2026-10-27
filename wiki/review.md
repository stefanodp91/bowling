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
- 2026-10-27 · [sounds](audio/sounds.md) rule 6 (music) · The human asked for background music;
  it is built as rule 6, but no acceptance criterion covers it (only a human writes criteria).
  Recommend adding: «[auto] the music loop is produced by `npm run audio:build` and checked by
  `audio:check` like the other sounds; [human] it sits under the effects and loops without an
  audible seam.» The first half already holds (`check-audio` covers `music-alley.wav`).

## Approved

Each entry: date · page · who approved · what they looked at.

_None yet._
