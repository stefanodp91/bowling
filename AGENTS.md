# AGENTS.md

The single rule file for every coding agent working in this repository (Claude Code, Codex, any
other). `CLAUDE.md` only imports this file. Keep it under 32 KiB: `npm run agents:lint` fails above.

## What this repository is

**Bowling** is a small open-source web demo: a bowling ball rolls by itself down a 500 m lane full of
obstacles and ends against ten pins. Nobody plays it: an autopilot drives the ball. The point of the
project is not the game but **how it is built**: by AI agents that read a wiki before acting, build
one item at a time, check and judge their own work, and leave written records for whoever comes next.

The six procedures that drive that work are in [`prompts/`](prompts/). The specification of what to
build is the [wiki](wiki/index.md). The entry point for an agent that starts from nothing is
[`BUILD.md`](BUILD.md).

## The rules that never bend

1. **Read before acting.** Before changing a file or explaining how something works, find the wiki
   pages that cover it (`npm run wiki:context -- <files>`; until that script exists, `wiki/index.md`),
   read them, then open the code they point to. The page says where to look; the code decides. Say
   which pages you read at the start of your work and again in your final report. Procedure:
   [`prompts/2-read-before-acting.md`](prompts/2-read-before-acting.md).
2. **The wiki is the specification.** A page with `status: planned` describes what must exist and
   is not built yet. `built` means the code exists and every automatic acceptance criterion passes.
   `approved` means a human looked at it and said so. See
   [`wiki/method/wiki-as-spec.md`](wiki/method/wiki-as-spec.md).
3. **Acceptance criteria belong to the human.** Never edit a page's `## Acceptance criteria` section
   to make failing code pass. If a criterion is wrong or impossible, leave it, and write the case in
   the «To judge» section of [`wiki/review.md`](wiki/review.md). `check-acceptance` enforces this
   once it exists.
4. **Only a human writes `approved`.** An agent may set `planned → built`, never `→ approved`, and
   never moves an entry from «To judge» to «Approved» in `wiki/review.md`.
5. **Clean room.** Never read, copy or paraphrase code from any repository other than this one and
   its declared open-source dependencies (their published packages and public documentation). Every
   mechanism here is designed from the wiki, in this repository's own words.
6. **Open-source hygiene.** Everything committed is public. No secrets, tokens, analytics or tracking.
   No downloaded images, models, fonts or sounds: references found on the web stay as links in the
   wiki, 3D models are built from code, sounds are generated from numbers by a committed script.
   `check-no-foreign-refs` scans files, file names and commit messages for terms that must never
   appear; it stores only their hashes. If it fails, remove the term — do not touch the hash list.
7. **English everywhere** — code, comments, wiki, commits, prompts — except
   `prompts/original-it.md`, which keeps the six procedures in their original Italian.
8. **Every commit signs agent and model** with a trailer, e.g.
   `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. `npm run stats` reads these trailers.

## How to build

Follow [`BUILD.md`](BUILD.md). In short: take the `planned` pages of the wiki in the order of their
`depends_on`, and for each one run [the self-approval loop](prompts/1-self-approval-loop.md).
After any code change, run [the documentation update](prompts/3-update-docs-after-change.md).
When an error costs you time, run [error → gate](prompts/5-error-to-gate.md). When you verify
something, run [verification record](prompts/6-verification-record.md). When a session ends with
work open, run [handoff](prompts/4-handoff.md).

## Commands

All commands run from the repository root. Until the `workspace` page is built, they do not exist
yet: building them is part of that page.

| Command | What it does |
|---|---|
| `npm ci` | Install the three workspaces (`models`, `game`, `storybook`) |
| `npm run dev` | Game dev server on `http://localhost:3000` |
| `npm run storybook` | Model catalogue on `http://localhost:6006` |
| `npm test` | Vitest in every workspace + `tsc --noEmit` in every workspace |
| `npm run check` | `npm test` + every static gate and its selftest + `wiki:lint`. The «automatic checks» of prompt 1; the pre-commit hook runs it |
| `npm run check:full` | `check` + the headless gates (`check-pilot`) |
| `npm run shot -- <target>` | Headless screenshot of a story or of the game at a given metre, into `shots/` |
| `npm run pilot -- --tracks <ids> --skill <s>` | Headless autopilot runs, one JSON line per run |
| `npm run bake:tracks` | Regenerate the committed track JSON files from their seeds |
| `npm run wiki:context -- <files>` | The wiki pages whose `canonical:` covers those files |
| `npm run wiki:touched` | The wiki pages touched by the current diff, and changed files no page covers |
| `npm run stats` | Pages built vs approved, commits per agent/model, rounds, gates |
| `npm run audio:build` / `audio:check` | Generate the sounds from numbers / verify the committed files match |
| `npm run acceptance:lock -- <page>` | **Humans only**: record a decided change to an acceptance section |

## Engineering standards

The code is read by people who were in the audience of a talk: it must be an example worth copying.

- **TypeScript strict** in every workspace (`strict`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`). No `any`, no `as` casts to silence the compiler, no `!` non-null
  assertions on values that can really be missing. Validate data at the boundary (zod) and trust
  the types inside.
- **Layers and dependency direction.** Pure domain logic (`game/src/domain/`: track, run, speed,
  impacts, scoring; `game/src/pilot/`) imports neither Babylon.js nor React. Scene code adapts the
  domain to Babylon via the graphic engine; UI code is React. `models/` imports only Babylon and the
  graphic engine, never the game. The one shared piece is `models/src/measures/`: pure physical
  measures that import nothing, which the domain may read
  ([model conventions](wiki/models/conventions.md)). `check-boundaries` enforces all of this.
- **Single responsibility, small units.** One concept per file. A file over 300 lines or a function
  over 50 lines is a design smell: split it before adding to it. No god objects, no "utils" dumping
  ground.
- **SOLID and DRY.** Depend on interfaces (ports) for anything external — engines, clock, random
  source, storage. One source of truth per fact: a number used in two places is a constant
  imported by both.
- **No magic values.** Every number and string with meaning has a name. Closed sets of choices are
  string-literal unions or `as const` objects, never bare strings. Every constant says, in its doc
  comment, where its value comes from (a regulation measure, a measurement, a design decision with
  its wiki page).
- **Tunables live in one place.** Speeds, penalties, timings, skill profiles, camera distances —
  every value that decides visible behaviour — are in `game/src/config/`, typed and documented,
  never scattered as literals in logic or components.
- **Determinism.** Randomness only through an injected seeded generator. Time only through an
  injected clock or the fixed physics step. Same track, same skill, same run.
- **React components** are function components with typed props; styles live in a sibling
  `*.module.css`, never inline. Every visible string goes through the i18n layer
  (`game/src/i18n/`), so another language is a new file, not a code change.
- **Errors are not silent.** No empty `catch`. A failure that stops the demo shows a clear message;
  a failure that does not is logged with context.
- **Tests first for logic.** Domain and pilot code is written test-first (Vitest). Scene and UI code
  is verified with screenshots and headless runs. Every gate has a `--selftest`.
- **Small commits.** Commit every finished step, with a message that says what and why.

## Traps

Traps found on the field go here, each with the symptom that reveals it.

- **A mesh without a material renders nothing.** Babylon is imported by deep paths, so the default
  `StandardMaterial` is not loaded. Symptom: the scene shows only its clear colour, and an
  asynchronous page error says «StandardMaterial needs to be imported before…». Every model sets
  its own PBR material ([model conventions](wiki/models/conventions.md)).
- **Reactylon's canvas has no size.** Symptom: a 300×150 canvas. The page or stage CSS sizes it.
- **A Babylon material plugin's uniform never arrives.** Symptom: the injected GLSL compiles but
  behaves as if every uniform were zero. `hardBindForSubMesh` is an «extra event»: set
  `registerForExtraEvents = true` before enabling the plugin, and mark the material's defines dirty
  if it was already compiled ([widening gutter](wiki/models/obstacles/widening-gutter.md)).
- **WebGPU draws a black canvas.** Reactylon's `<Engine>` picks WebGPU when the browser has it; in
  development the engine is mounted twice and the console fills with «TextureView … associated with
  BabylonWebGPUDevice1, cannot be used with BabylonWebGPUDevice0» while the HUD keeps running.
  Headless shots never see it (no WebGPU adapter). Every `<Engine>` has `forceWebGL`;
  `check-webgl` enforces it.
- **The audio engine decodes nothing before the first gesture.** Symptom: `cues.warm` resolves,
  no `.wav` request is made, and every `hold` logs «held voice … was never warmed». Warm after
  `unlock()` ([sounds](wiki/audio/sounds.md)).
