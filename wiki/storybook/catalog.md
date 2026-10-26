---
title: Storybook catalogue — one story per model
type: spec
status: planned
depends_on: [workspace/monorepo.md]
canonical: []
verified: 2026-10-26
---

# Storybook catalogue

> Boundary: the catalogue's shape and the contract of a model story. NOT covered: the models
> themselves (`models/*`), how screenshots are taken ([shot tool](../tools/shot.md)).

## Purpose

A model is judged alone, under fixed light and camera, before it reaches the game. The catalogue is
where the agent looks at a model in step 5 of [prompt 1](../../prompts/1-self-approval-loop.md), and
the visual source of truth: the game must show a model exactly as its story does.

## Rules

1. Minimal Storybook: no addons beyond what `@storybook/react-vite` needs, no docs pages.
2. One shared `ModelStage` component (Reactylon scene, neutral grey floor, one key light + ambient,
   orbit camera with a fixed default pose framing the model's bounding box) renders any model
   factory from `@models`. Stories differ only in which factory they pass and its parameters.
3. Story ids are stable: `models-<name>` (for example `models-ball`, `models-pins`,
   `models-obstacle-sweep-bar`), plus `scenes-pin-deck` (lane end + ten pins).
4. A story signals readiness for screenshots by setting `data-ready="true"` on its root element after
   the scene has rendered two frames.
5. A story uses the same factory call as the game: no catalogue-only geometry.

## Acceptance criteria

1. [auto] `npm run storybook` starts and lists a `models-placeholder` story (a unit cube from
   `@models`) until the first model page is built; every later model page adds its own story.
2. [auto] Each story reaches `data-ready="true"` headlessly within 10 s (via the
   [shot tool](../tools/shot.md)).
3. [auto] No story file contains Babylon mesh construction calls (`MeshBuilder`, `CreateBox`,
   `VertexData`…): geometry comes only from `@models` (a test greps `storybook/src`).

## References

_Filled by the agent (prompt 1, step 2)._

## Rounds

_Filled by the agent (prompt 1, step 5)._
