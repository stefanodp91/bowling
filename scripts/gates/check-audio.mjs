// check-audio (npm run audio:check): the committed sounds are exactly what scripts/audio/generate.mjs
// produces (wiki/audio/sounds.md, rule 2). Regenerates into a temporary folder and compares bytes.
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { finding, runGate, withTempDir } from '../lib/gate.mjs';
import { AUDIO_DIR, generateInto } from '../audio/generate.mjs';

export function checkAudio(committedDir) {
  return withTempDir((fresh) => {
    const expected = generateInto(fresh);
    const committed = existsSync(committedDir) ? readdirSync(committedDir).filter((f) => f.endsWith('.wav')) : [];
    return [
      ...committed.filter((f) => !expected.includes(f)).map((f) => finding(`game/public/audio/${f}`, undefined, 'not produced by the generator: remove it or add it to scripts/audio/sounds.mjs')),
      ...expected.flatMap((f) => {
        const path = join(committedDir, f);
        if (!existsSync(path)) return [finding(`game/public/audio/${f}`, undefined, 'missing: run npm run audio:build')];
        return readFileSync(path).equals(readFileSync(join(fresh, f))) ? [] : [finding(`game/public/audio/${f}`, undefined, 'differs from the generator output: run npm run audio:build and commit')];
      }),
    ];
  });
}

runGate('check-audio', {
  check: () => checkAudio(AUDIO_DIR),
  selftest: () =>
    withTempDir((copy) => {
      for (const f of readdirSync(AUDIO_DIR)) copyFileSync(join(AUDIO_DIR, f), join(copy, f));
      const victim = join(copy, 'impact.wav');
      const bytes = readFileSync(victim);
      bytes[bytes.length - 1] = (bytes[bytes.length - 1] ?? 0) ^ 1;
      writeFileSync(victim, bytes);
      return checkAudio(copy);
    }),
});
