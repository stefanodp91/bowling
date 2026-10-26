---
title: Workspace — monorepo, engines, toolchain and commands
type: spec
status: planned
depends_on: []
canonical: []
verified: 2026-10-26
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

_Filled by the agent (prompt 1, step 2)._

## Rounds

_Filled by the agent (prompt 1, step 5)._
