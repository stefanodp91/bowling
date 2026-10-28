---
title: Gates — automatic checks that block a regression
type: spec
status: approved
approved_on: 2026-10-28
depends_on: [workspace/monorepo.md]
canonical: [scripts/gates/, scripts/lib/gate.mjs, scripts/lib/imports.mjs, scripts/run-gates.mjs, scripts/tests/gates-table.test.mjs, .githooks/commit-msg]
verified: 2026-10-26
---

# Gates

> Boundary: the code gates, their common contract, and the starting set. NOT covered: wiki checks
> ([wiki tooling](wiki-tooling.md)); gates owned by a feature page are listed here but specified
> there (`check-tracks` in [track format](../track/track-format.md), `check-pilot` in
> [headless runs](../pilot/headless-runs.md)).

## Purpose

An error that cost time once must not come back unnoticed ([prompt 5](../../prompts/5-error-to-gate.md)).
A gate is that memory, executed on every commit.

## Rules

1. **Contract.** A gate is `scripts/gates/check-<name>.mjs`. Exit 0 = pass, 1 = fail, with a
   message that names the file, the line when there is one, and what to do. Every gate supports
   `--selftest`: it builds a wrong case (in a temporary directory or in memory), runs itself on it,
   and exits 0 only if it rejected it.
2. **Wiring.** `npm run check` runs every static gate; `npm run check:full` adds the headless ones.
   `npm run gates:selftest` runs every gate's `--selftest`; `check` runs it too.
3. **Thresholds** are imported from the code (`game/src/config/`) or derived from a measurement
   whose record is linked in a comment. No hand-written number that depends on something else.
4. **This page lists every gate.** Prompt 5 adds a row for each new one: what it checks, why it
   exists (the error that paid for it), how to read its failure.

## The starting set

| Gate | Checks | Why |
|---|---|---|
| `check-engines` | the installed graphic and audio engines are exactly the versions and release URLs declared in `game/package.json` | engines are used only from verified releases |
| `check-boundaries` | `models/` imports only Babylon.js and the graphic engine; `game/src/domain/` and `game/src/pilot/` import neither Babylon.js nor React; `ui/` does not import `scene/` internals | the layers of [AGENTS.md](../../AGENTS.md) |
| `check-no-foreign-refs` | no tracked file, file name or commit message contains a forbidden term | open-source hygiene (AGENTS.md rule 6) |
| `check-magic-numbers` | numeric literals other than 0, 1, -1, 2 and array indexes do not appear in `game/src/domain/`, `game/src/pilot/`, `game/src/scene/` outside `config/` and named `const` declarations | tunables live in one place |
| `check-file-size` | no source file over 300 lines | single responsibility |
| `check-audio` | the committed WAV files equal, byte for byte, what `scripts/audio/generate.mjs` produces (see [sounds](../audio/sounds.md)) | every sound has its source in the repository |
| `check-notices` | `THIRD_PARTY_NOTICES.md` has a section for every production dependency of the game (see [release](../release/open-source.md)) | every shipped package is credited with its licence |
| `check-webgl` | every Reactylon `<Engine>` in `game/src` and `storybook/src` has `forceWebGL` | paid on 2026-10-27: with WebGPU available the game drew a black canvas (two WebGPU devices crossed by React's double mount in development) while headless shots, which have no WebGPU, looked fine |
| `check-tracks` | see [track format](../track/track-format.md): schema, rules, index, and equality with the baked seed | every track is solvable |
| `check-pilot` (full) | see [headless runs](../pilot/headless-runs.md): `perfect` on every track in the browser — no impact, a result, no console error, active meshes within budget, impacts equal to `simulateRun` | the pilot really plays |

### `check-no-foreign-refs` in detail

The forbidden terms must not appear in the repository, not even inside the gate. The gate stores
only their SHA-256 hashes. It normalises text by lowercasing and splitting on every
non-alphanumeric character into tokens; it hashes every run of 1, 2 and 3 consecutive tokens joined
without separator, and fails if a hash is in the list. It scans every file tracked by git
(`git ls-files`, text files only), every tracked path, and every commit message
(`git log --format=%B`). Hashes (SHA-256 of the joined lowercase string):

```
39cd17db5d5074f4aa4572ad9733a9fb4b2e5ce453d21e8c9ea07240cf55a2e8
90e70e0dff2d7c8b1eea8a60b7fd22bc27dfd76fc286802d7df084316fa0462c
15544ef39dac74f26587a1c3dfa7d6bff1cedaab10d9e208ef78750dead11c3e
```

Its `--selftest` adds the hash of a synthetic word to the list in memory, writes a temporary file
containing that word, and verifies the gate rejects it. If the gate fails on real content, remove
the term from the content; never edit the hash list.

## Acceptance criteria

1. [auto] `npm run check` runs every static gate in the starting set except `check-tracks`, which
   joins when its page is built, and passes.
2. [auto] `npm run gates:selftest` runs every gate's `--selftest` and passes; each selftest really
   exercised a rejection (it prints the rejected case).
3. [auto] `check-no-foreign-refs` passes on the full git history at the time this page is built.
4. [auto] `check-boundaries --selftest` rejects a temporary file in `game/src/domain/` that imports
   `@babylonjs/core`.
5. [auto] The table on this page has one row per file in `scripts/gates/` (checked by a test).

## References

- Git hooks: `pre-commit` runs before the message is asked and a non-zero exit aborts the commit;
  `commit-msg` receives the path of the message file as its only argument and can refuse it
  (https://git-scm.com/docs/githooks). `core.hooksPath` relative to the working tree root
  (https://git-scm.com/docs/git-config).
- TypeScript compiler API (`ts.createSourceFile`, `ts.forEachChild`) parses a file without a
  program, which is enough to read imports and numeric literals
  (https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API).

## Rounds

- 2026-10-26 · round 1 · Built the five static gates, the runner and the table test. First run on
  the real code: `check-boundaries` found two cases — a test file importing `vitest` (now allowed in
  `*.test.ts` only) and `ui/App.tsx` importing `scene/GameCanvas` directly (now through
  `game/src/scene/index.ts`). The other gates passed at once. Every `--selftest` printed the case it
  rejected (`npm run gates:selftest`: 5 of 5). `check-no-foreign-refs` passes on the full history
  (2 commits at the time). Gap found while building: the pre-commit hook cannot see the message of
  the commit being written, so `check-no-foreign-refs --message-file` runs from a `commit-msg`
  hook too.

## Canonical files

- `scripts/lib/gate.mjs` holds the contract (`runGate`, findings, temp dirs, file walking);
  `scripts/lib/imports.mjs` reads import specifiers with the TypeScript parser. Helpers live in
  `scripts/lib/`, never in `scripts/gates/`, because every file there is a gate with a row above.
- `scripts/run-gates.mjs` discovers `scripts/gates/check-*.mjs`; its `HEADLESS_GATES` set names
  the gates that run only in `check:full`.
- `check-boundaries` rules, as built: `models/src/measures/` imports nothing; the rest of
  `models/src/` imports Babylon.js, the graphic engine and its own files; `game/src/domain/` and
  `game/src/pilot/` import their own files, `zod` and `@models/measures/...` only; `game/src/ui/`
  reaches `scene/` only through `scene/index.ts`. Test files may also import `vitest` and `node:`
  built-ins (they read committed fixtures such as the tracks).
- `check-magic-numbers` accepts literals inside module-level `const SCREAMING_CASE` declarations
  and array indexes, and skips `*.test.ts(x)`: a test's literals are the values it states.
- `npm run check` = `npm test` + `npm run test:scripts` (Node's test runner on
  `scripts/tests/`) + `npm run gates` + `npm run gates:selftest`.
