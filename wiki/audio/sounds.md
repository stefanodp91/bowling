---
title: Sounds — generated from numbers, played by the audio engine
type: spec
status: planned
depends_on: [game/pins.md, game/hud.md]
canonical: []
verified: 2026-10-26
---

# Sounds

> Boundary: the sound set, the script that generates it, and how the game plays it through the audio
> engine. NOT covered: the audio engine's internals (its own documentation in `node_modules`).

## Purpose

A bowling alley is mostly sound: the rumble of the ball and the crash of the pins. Here every sound
comes from a committed script, so an open-source audience gets the source of every file.

## Rules

1. **Generation:** `npm run audio:build` runs `scripts/audio/generate.mjs`, a pure, seeded Node
   script that synthesises WAV files into `game/public/audio/`: `roll` (a seamless loop of
   low-passed noise and low rumble), `impact` (a dull thud), `pin-clack` (a short hard-wood click,
   several variants), `strike` (a short bright flourish). Parameters are named constants with a
   comment on the sound they shape. The WAV files are committed as build outputs of that script.
2. `npm run audio:check` regenerates into a temporary folder and fails if any committed file differs
   byte for byte (a gate in `check`).
3. **Playback** through the audio engine (`obsidian-eclipse-audio-engine`, Web Audio transport):
   `roll` follows the ball speed (gain and, if the engine supports it, playback rate; otherwise
   crossfaded speed bands — the choice and why go in «Rounds»); `impact` on each impact event;
   `pin-clack` on pin contacts above a contact-speed threshold, at most `MAX_CLACKS_PER_S`;
   `strike` on a score of ten.
4. **Muted until the first gesture**, as browsers require: a sound toggle in the HUD (localised,
   accessible); any click on the page also unlocks audio through the engine.
5. Values in `game/src/config/audio.ts`.

## Acceptance criteria

1. [auto] `npm run audio:check` passes; `--selftest` rejects a modified WAV.
2. [auto] Unit test: the mapping from game events to sound cues (pure) gives the expected cues for
   a scripted run (one impact, eight pins, no strike).
3. [human] The rumble rises with speed and the pin crash sounds like wood, not glass.

## References

_Filled by the agent (prompt 1, step 2): recordings of real bowling alleys to compare against
(links only), synthesis techniques for impacts._

## Rounds

_Filled by the agent (prompt 1, step 5)._
