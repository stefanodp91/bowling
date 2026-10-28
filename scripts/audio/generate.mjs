// npm run audio:build: synthesises the sound set into game/public/audio/ (wiki/audio/sounds.md).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from '../lib/gate.mjs';
import { SAMPLE_RATE, soundSet } from './sounds.mjs';
import { encodeWav } from './wav.mjs';

export const AUDIO_DIR = join(REPO_ROOT, 'game/public/audio');

/** Writes every sound as <name>.wav into `dir`; returns the file names. */
export function generateInto(dir) {
  mkdirSync(dir, { recursive: true });
  return Object.entries(soundSet()).map(([name, samples]) => {
    const file = `${name}.wav`;
    writeFileSync(join(dir, file), encodeWav(samples, SAMPLE_RATE));
    return file;
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const file of generateInto(AUDIO_DIR)) console.log(`game/public/audio/${file}`);
}
