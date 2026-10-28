// check-boundaries: the layers of AGENTS.md («Layers and dependency direction»).
// - models/src imports only Babylon.js, the graphic engine and its own files;
// - models/src/measures imports nothing at all;
// - game/src/domain and game/src/pilot import neither Babylon.js nor React nor any engine, and from
//   @models only the pure measures (@models/measures/...);
// - game/src/ui imports from scene/ only its public entry, scene/index.ts.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { finding, readText, rel, walk, withTempDir, runGate } from '../lib/gate.mjs';
import { importsOf } from '../lib/imports.mjs';

const SOURCE = /\.(ts|tsx|mts|js|mjs)$/;
/** Test files may also import the test runner and Node built-ins (to read committed fixtures). */
const TEST_FILE = /\.test\.(ts|tsx)$/;
const isRelative = (s) => s.startsWith('./') || s.startsWith('../');
const isBabylon = (s) => s === '@babylonjs/core' || s.startsWith('@babylonjs/');
const isGraphicEngine = (s) => s === 'obsidian-eclipse-graphic-engine' || s.startsWith('obsidian-eclipse-graphic-engine/');
const isReact = (s) => s === 'react' || s.startsWith('react/') || s === 'react-dom' || s.startsWith('react-dom/') || s.startsWith('reactylon');
const isMeasures = (s) => s.startsWith('@models/measures/');

/** One rule per layer: which files it covers and what an import must satisfy. */
const RULES = [
  {
    covers: (path) => path.startsWith('models/src/measures/'),
    allows: (spec) => isRelative(spec),
    why: 'models/src/measures/ is pure: it imports nothing but its own files',
  },
  {
    covers: (path) => path.startsWith('models/src/'),
    allows: (spec) => isRelative(spec) || isBabylon(spec) || isGraphicEngine(spec),
    why: 'models/ imports only Babylon.js and the graphic engine, never the game',
  },
  {
    covers: (path) => path.startsWith('game/src/domain/') || path.startsWith('game/src/pilot/'),
    allows: (spec, path) => (isRelative(spec) && !escapesTo(path, spec, ['scene', 'ui', 'audio', 'dev'])) || isMeasures(spec) || spec === 'zod',
    why: 'domain/ and pilot/ are pure: no Babylon.js, React or engines; from @models only @models/measures/',
  },
  {
    covers: (path) => path.startsWith('game/src/ui/'),
    allows: (spec, path) => !escapesTo(path, spec, ['scene']) || ['game/src/scene', 'game/src/scene/index'].includes(resolvesTo(path, spec)),
    why: 'ui/ imports scene/ only through game/src/scene/index.ts',
  },
];

function resolvesTo(path, spec) {
  return posix.normalize(posix.join(posix.dirname(path), spec)).replace(/\.(ts|tsx)$/, '');
}

function escapesTo(path, spec, folders) {
  if (!isRelative(spec)) return false;
  const target = resolvesTo(path, spec);
  return folders.some((folder) => target.startsWith(`game/src/${folder}/`) || target === `game/src/${folder}`);
}

export function checkBoundaries(root) {
  const files = ['models/src', 'game/src'].flatMap((dir) => walk(join(root, dir))).filter((f) => SOURCE.test(f));
  return files.flatMap((file) => {
    const path = rel(root, file);
    const rule = RULES.find((r) => r.covers(path));
    if (rule === undefined) return [];
    const isTest = TEST_FILE.test(path);
    return importsOf(path, readText(file))
      .filter(({ specifier }) => !(isTest && (specifier === 'vitest' || specifier.startsWith('node:'))) && !rule.allows(specifier, path))
      .map(({ specifier, line }) => finding(path, line, `imports «${specifier}»: ${rule.why}`));
  });
}

runGate('check-boundaries', {
  check: checkBoundaries,
  selftest: () =>
    withTempDir((dir) => {
      const file = join(dir, 'game/src/domain/selftest-wrong.ts');
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, "import { Vector3 } from '@babylonjs/core';\nexport const origin = Vector3.Zero();\n");
      return checkBoundaries(dir);
    }),
});
