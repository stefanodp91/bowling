// check-webgl: every Reactylon <Engine> renders with WebGL (forceWebGL), never WebGPU.
// Why: Reactylon picks WebGPU when the browser offers it; in development React mounts the engine
// twice and the two WebGPU devices get crossed — every frame is rejected and the canvas stays black
// while the HUD runs. Headless Chromium has no WebGPU, so shots never showed it. The game's
// board-hole material plugin is GLSL only, too (wiki/method/gates.md).
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import ts from 'typescript';
import { finding, readText, rel, runGate, walk, withTempDir } from '../lib/gate.mjs';
import { lineOf } from '../lib/imports.mjs';

const SCANNED = ['game/src', 'storybook/src'];

export function enginesWithoutWebGL(path, text) {
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = [];
  const visit = (node) => {
    const opening = ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node) ? node : null;
    if (opening !== null && opening.tagName.getText(source) === 'Engine') {
      const forced = opening.attributes.properties.some((p) => ts.isJsxAttribute(p) && p.name.getText(source) === 'forceWebGL');
      if (!forced) found.push(finding(path, lineOf(source, node), '<Engine> without forceWebGL: WebGPU renders a black canvas here (AGENTS.md traps)'));
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

export function checkWebGL(root) {
  return SCANNED.flatMap((dir) => walk(join(root, dir)))
    .filter((file) => file.endsWith('.tsx'))
    .flatMap((file) => enginesWithoutWebGL(rel(root, file), readText(file)));
}

runGate('check-webgl', {
  check: checkWebGL,
  selftest: () =>
    withTempDir((dir) => {
      const file = join(dir, 'game/src/scene/Wrong.tsx');
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, "import { Engine } from 'reactylon/web';\nexport const Wrong = () => <Engine><div /></Engine>;\n");
      return checkWebGL(dir);
    }),
});
