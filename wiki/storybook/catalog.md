---
title: Storybook catalogue — one story per model
type: spec
status: built
depends_on: [workspace/monorepo.md]
canonical: [storybook/src/stage/, storybook/src/stories/, storybook/src/no-geometry.test.ts, storybook/.storybook/main.ts, models/src/stage/stage-floor.ts, models/src/environment/]
verified: 2026-10-28
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
   factory from `@models`. Stories differ only in which factory they pass and its parameters; a
   model seen from inside, like a room, may give a fixed `inside` view instead of the orbit pose.
3. Story ids are stable: `models-<name>` (for example `models-ball`, `models-pins`,
   `models-obstacle-soda-cans`), plus `scenes-pin-deck` (lane end + ten pins).
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

- Storybook story ids are URL-sanitised from the CSF `title` and the export name; the iframe of a
  story opens at `iframe.html?id=<story-id>&viewMode=story`, and the `args` query parameter
  (`args=key:value`, alphanumerics, spaces, `_` and `-` only) overrides its initial args
  (https://storybook.js.org/docs/7.1/writing-stories/args, https://storybook.js.org/docs/writing-stories).
- Image-based lighting: a PBR material reflects `scene.environmentTexture`; without one, metals and
  clear coats look flat (https://doc.babylonjs.com/features/featuresDeepDive/materials/using/introToPBR).

## Rounds

- 2026-10-26 · round 1 · Built `ModelStage` (mount in `mountStage.ts`, tunables in
  `stage-config.ts`), the grey floor and a generated alley environment in `models/` (stories may
  not build geometry), and the no-geometry test. Shots: 4 (default and close of the placeholder,
  twice). Wrong in the first pair: the close-up filled the frame with one face of the cube and the
  floor was washed out → close distance 0.6 → 0.85 of the framing radius, key light 2.2 → 1.6.
  Then: `npm run shot:verify` — `models-placeholder` ready in 1.4 s, centre pixel rgb(183,134,85)
  against background #1B1D22.

- 2026-10-27 · round 2 · Reported by the human: after «Run again» the canvas was black while the
  HUD ran (91 m, 1 impact). Reproduced in the app's browser on a real GPU — on any load, not only
  after «Run again» — and never in headless shots. Cause: Reactylon's `<Engine>` chose WebGPU, and
  React's double mount in development crossed two WebGPU devices («TextureView … associated with
  BabylonWebGPUDevice1, cannot be used with BabylonWebGPUDevice0»), so every frame was rejected.
  Fix: `<Engine forceWebGL>` here and in the catalogue's stage; the board-hole plugin is GLSL only
  anyway. Prompt 5: new gate `check-webgl`, trap in AGENTS.md. After the fix the app's browser
  renders lane-02 with the HUD (1 shot).
- 2026-10-28 · round 3 · Stories `models-obstacle-wet-floor-sign` and `models-obstacle-soda-cans`
  replace the stray pins and the sweep bar; both reach ready (2 shots each).
- 2026-10-28 · round 4 · The alley segment has one story per theme (`Default`, `Neon`, `Space`,
  `Tropical`, `Diner`), seen from inside down the lanes: the orbit pose framed the room from
  outside and showed only its roof. All reach ready (5 shots).

## Canonical files

- **Story ids, as built.** Storybook always appends the story name to an id, so each story file
  has the title `Models/<Name>` (or `Scenes/<Name>`) and exports exactly one story, `Default`: the
  catalogue lists `models-<name>` and the story itself is `models-<name>--default`. The shot tool
  accepts `story:models-<name>` and opens `models-<name>--default`.
- `ModelStage` takes `factory`, `options` and `angle` (`default` | `close`); the camera frames the
  bounding sphere of `root`'s hierarchy. `data-ready` becomes `"true"` after two frames rendered
  with `scene.isReady()`. An animated model's `animate` receives seconds since mount.
- `applyAlleyEnvironment` (in `models/`, shared with the game) generates a cube texture from
  `alleyRadiance`: dim warm ceiling with light strips along +z, dark walls and floor.
