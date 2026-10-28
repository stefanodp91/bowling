---
title: Workspace — monorepo, engines, toolchain and commands
type: spec
status: built
depends_on: []
canonical: [package.json, package-lock.json, tsconfig.base.json, .githooks/pre-commit, scripts/not-built.mjs, models/package.json, models/tsconfig.json, models/vitest.config.ts, models/src/index.ts, models/src/model-handle.ts, game/package.json, game/tsconfig.json, game/vite.config.ts, game/vitest.config.ts, game/index.html, game/src/main.tsx, game/src/ui/App.tsx, game/src/ui/global.css, game/src/scene/GameCanvas.tsx, storybook/package.json, storybook/tsconfig.json, storybook/vitest.config.ts, storybook/.storybook/main.ts]
verified: 2026-10-28
---

# Workspace

> Boundary: the repository skeleton — npm workspaces, toolchain, the two engines, the shared
> TypeScript and test setup, the root commands. NOT covered: the gates themselves
> ([gates](../method/gates.md)), the wiki scripts ([wiki tooling](../method/wiki-tooling.md)).

## Purpose

Give every later page a place to live and the same commands to verify it. Three modules, each with
one job, mirroring a game built on independent engines:

```
models/      3D content: pure Babylon.js mesh factories. Shared by the game and the catalogue.
game/        the demo: React 19 + Reactylon on the graphic engine, Havok physics, audio engine.
storybook/   the catalogue: one story per model; the visual source of truth for models.
```

## Rules

1. **npm workspaces** at the root: `models`, `game`, `storybook`. Root `package.json` is private and
   has `"engines": { "node": ">=22.11" }`.
2. **Engines come only from their published releases**, pinned by URL, never from a local path:
   - graphic engine: `obsidian-eclipse-graphic-engine` from
     `https://github.com/stefanodp91/obsidian-eclipse-graphic-engine/releases/download/v0.2.3/obsidian-eclipse-graphic-engine-0.2.3.tgz`
   - audio engine: `obsidian-eclipse-audio-engine` from
     `https://github.com/stefanodp91/obsidian-eclipse-audio-engine/releases/download/v0.1.1/obsidian-eclipse-audio-engine-0.1.1.tgz`

   Read their README and type declarations in `node_modules` to learn their API; they are the only
   external code you may read besides other declared dependencies.
3. **Stack:** React 19, Reactylon 3.5.8 (React renderer for Babylon.js), `@babylonjs/core` 9,
   `@babylonjs/havok` 1, Vite 7 with `@vitejs/plugin-react` and `babel-plugin-reactylon`, TypeScript
   5 strict, Vitest 3, zod 4, i18next + react-i18next. The game mounts its Reactylon scene through
   the graphic engine's `ReactylonSceneBridge` (`obsidian-eclipse-graphic-engine/reactylon`).
   Storybook 10 with `@storybook/react-vite`. Exact versions are whatever the lockfile pins; pick
   current releases of the same majors.
4. **One copy of Babylon.js.** `models/` declares `@babylonjs/core` and the graphic engine as peer
   dependencies; the game and Storybook resolve `@models` to `models/src/index.ts` (a TypeScript
   path + Vite alias) and dedupe `@babylonjs/core`. `models/` has no build step.
5. **TypeScript:** a root `tsconfig.base.json` with `strict`, `noUncheckedIndexedAccess`,
   `exactOptionalPropertyTypes`, `noImplicitOverride`; every workspace extends it.
6. **Source layout of `game/src/`:** `config/` (all tunables), `domain/` (pure logic: track, run,
   impacts, scoring), `pilot/` (the autopilot, pure), `scene/` (Reactylon components and Babylon
   adapters), `ui/` (React HUD and screens, each component with its `*.module.css`), `audio/`,
   `i18n/`, `dev/` (test hooks for headless tools, excluded from production behaviour).
7. **Git:** a `.gitignore` for `node_modules/`, `dist/`, `storybook-static/`, `shots/`, OS files.
   `npm ci` sets `core.hooksPath` to `.githooks/` (via `prepare`); `.githooks/pre-commit` runs
   `npm run check`.
8. **Root commands**, defined here and filled by the pages that own them:
   `dev`, `storybook`, `test`, `check` (fast: typecheck, unit tests, static gates, wiki lint),
   `check:full` (`check` + headless gates), `shot`, `pilot`, `bake:tracks`, `wiki:*`, `stats`.
   A command whose page is not built yet prints «not built yet: see wiki/<page>» and exits 1.

## Acceptance criteria

1. [auto] `npm ci` from a clean clone succeeds and installs both engines from their release URLs.
2. [auto] `npm test` runs Vitest and `tsc --noEmit` in all three workspaces and passes (an empty
   smoke test per workspace is enough at this stage).
3. [auto] `npm run dev` serves a page on `http://localhost:3000` that mounts a Reactylon scene
   through `ReactylonSceneBridge` and renders at least one frame without console errors (checked
   headlessly, see [shot tool](../tools/shot.md) once built; until then by loading the page in a
   headless browser and reading the console).
4. [auto] `npm run storybook` serves on `http://localhost:6006` and lists at least one story that
   imports from `@models`.
5. [auto] `npm ls @babylonjs/core` shows a single deduplicated version.
6. [auto] A commit with a failing `npm run check` is refused by the pre-commit hook.

## References

- npm workspaces: one root `node_modules`, shared dependencies hoisted, workspaces linked by name
  (https://docs.npmjs.com/cli/v10/using-npm/workspaces; RFC
  https://github.com/npm/rfcs/blob/9e38cbc3ff17112e89763d88e8237edb4251837a/accepted/0026-workspaces.md).
- Babylon.js ES modules are tree-shaken by deep imports; features that patch prototypes need a
  side-effect import, and a missing one fails at runtime with «X needs to be imported before as it
  contains a side-effect» (Babylon forum,
  https://forum.babylonjs.com/t/importing-side-effects/27434 and
  https://forum.babylonjs.com/t/runtime-error-uncaught-in-promise-audioscenecomponent-needs-to-be-imported-before-as-it-contains-a-side-effect-required-by-your-code/33842).
- Reactylon 3.5.8 (`node_modules/reactylon`): `<Engine>` from `reactylon/web` creates the canvas
  and the render loop; `<Scene onSceneReady>` runs before the first frame; peers include
  `@babylonjs/gui` and `react-reconciler`. `babel-plugin-reactylon` is wired through
  `@vitejs/plugin-react`'s `babel.plugins` (its README, «Vite»).
- Graphic engine 0.2.3 README: `ReactylonSceneBridge({ mount })` mounts imperative code into the
  scene Reactylon owns; `mount(scene)` returns its cleanup.

## Rounds

- 2026-10-26 · round 1 · Built the three workspaces, root commands, hooks. Looked at: headless
  Chromium (SwiftShader) on `npm run dev` and on the Storybook iframe of `models-placeholder`, 4
  screenshots. Wrong: (a) the canvas rendered at 300×150 because Reactylon's canvas has no size of
  its own → the page CSS sizes it; (b) Reactylon warned «No active camera after first commit»
  because the camera was created in the bridge mount → it is now created in `onSceneReady`;
  (c) the cube was invisible, only the clear colour showed, with an asynchronous page error
  «StandardMaterial needs to be imported before…»: a mesh without a material asks Babylon for the
  default `StandardMaterial`, which tree-shaking left out → the placeholder has its own PBR material
  (as every model must, [conventions](../models/conventions.md)). Then: game page and story show
  the orange cube with no console error. Criteria: (1) `npm ci` in a clean copy exits 0 and the
  lockfile resolves both engines to their release URLs; (2) `npm test` green in the three
  workspaces; (3) and (4) checked headlessly as above; (5) `npm ls @babylonjs/core` shows 9.32.0
  once, deduped; (6) in the clean copy a commit with a failing test was refused by the hook
  («pre-commit: npm run check failed; commit refused.»).
- 2026-10-28 · round 4 · `game/vite.config.ts` excludes `@babylonjs/core` from `optimizeDeps`: a
  pre-bundled Babylon could hold two shader stores after a re-bundle and draw nothing (the run
  page's round 9, AGENTS.md traps). Dev load stays fast (menu in ≈ 0.3 s); `check:full` passes.

## Canonical files

- Commands not built yet run `scripts/not-built.mjs <page>`, which prints «not built yet: see
  wiki/<page>» and exits 1. `check` and `check:full` contain only what is built: they must stay
  green, because the pre-commit hook runs `check`.
- Every workspace's `test` script is `vitest run && tsc --noEmit`; the root `test` runs them all.
- `@models` resolves to `models/src/index.ts` through `tsconfig` `paths` and a Vite alias in
  `game/vite.config.ts`, `game/vitest.config.ts` and `storybook/.storybook/main.ts`; all three
  dedupe `@babylonjs/core`, `react` and `react-dom`.
- The game creates its camera in `onSceneReady` and mounts everything else through
  `ReactylonSceneBridge`; Vitest 3 (pinned by this page) carries `npm audit` advisories on
  `tinypool`/`@vitest/mocker` that concern the test runner only, never the shipped game.
