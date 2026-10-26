// check-file-size: no source file over 300 lines (AGENTS.md, «Single responsibility, small units»).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { finding, readText, rel, runGate, walk, withTempDir } from '../lib/gate.mjs';

/** The line budget of a source file, from AGENTS.md («a file over 300 lines … is a design smell»). */
export const MAX_SOURCE_LINES = 300;

const SCANNED = ['models/src', 'game/src', 'storybook/src', 'storybook/.storybook', 'scripts'];
const SOURCE = /\.(ts|tsx|mts|js|mjs|css)$/;

export function checkFileSize(root) {
  return SCANNED.flatMap((dir) => walk(join(root, dir)))
    .filter((file) => SOURCE.test(file))
    .flatMap((file) => {
      const lines = readText(file).split('\n').length;
      return lines > MAX_SOURCE_LINES
        ? [finding(rel(root, file), undefined, `${lines} lines, over ${MAX_SOURCE_LINES}: split it by responsibility`)]
        : [];
    });
}

runGate('check-file-size', {
  check: checkFileSize,
  selftest: () =>
    withTempDir((dir) => {
      mkdirSync(join(dir, 'game/src/domain'), { recursive: true });
      const body = Array.from({ length: MAX_SOURCE_LINES + 1 }, (_, i) => `export const LINE_${i} = ${i};`).join('\n');
      writeFileSync(join(dir, 'game/src/domain/too-long.ts'), body);
      return checkFileSize(dir);
    }),
});
