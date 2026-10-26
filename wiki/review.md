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

## Approved

Each entry: date · page · who approved · what they looked at.

_None yet._
