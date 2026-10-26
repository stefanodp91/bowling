// check-magic-numbers: numeric literals other than 0, 1, -1, 2 and array indexes do not appear in
// game/src/domain, game/src/pilot and game/src/scene outside config/ and named const declarations
// (AGENTS.md, «No magic values»; wiki/method/gates.md).
// A named const declaration is a module-level `const SCREAMING_CASE = ...`; tests are not scanned,
// because their literals are the expected values the test states.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import ts from 'typescript';
import { finding, readText, rel, runGate, walk, withTempDir } from '../lib/gate.mjs';
import { lineOf } from '../lib/imports.mjs';

const SCANNED = ['game/src/domain', 'game/src/pilot', 'game/src/scene'];
const SOURCE = /\.(ts|tsx)$/;
const TEST_FILE = /\.test\.(ts|tsx)$/;
const ALLOWED_VALUES = new Set([0, 1, 2]);
const CONSTANT_NAME = /^[A-Z][A-Z0-9_]*$/;

function isNamedConstant(node) {
  for (let current = node.parent; current !== undefined; current = current.parent) {
    if (ts.isVariableDeclaration(current) && ts.isIdentifier(current.name) && CONSTANT_NAME.test(current.name.text)) {
      const list = current.parent;
      const statement = list?.parent;
      const isConst = list !== undefined && (list.flags & ts.NodeFlags.Const) !== 0;
      return isConst && statement !== undefined && ts.isSourceFile(statement.parent);
    }
  }
  return false;
}

function isArrayIndex(node) {
  return ts.isElementAccessExpression(node.parent) && node.parent.argumentExpression === node;
}

export function magicNumbersIn(path, text) {
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = [];
  const visit = (node) => {
    if (ts.isNumericLiteral(node)) {
      const value = Number(node.text);
      if (!ALLOWED_VALUES.has(value) && !isArrayIndex(node) && !isNamedConstant(node)) {
        found.push(finding(path, lineOf(source, node), `magic number ${node.text}: name it in game/src/config/ or as a module const`));
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

export function checkMagicNumbers(root) {
  return SCANNED.flatMap((dir) => walk(join(root, dir)))
    .filter((file) => SOURCE.test(file) && !TEST_FILE.test(file))
    .flatMap((file) => magicNumbersIn(rel(root, file), readText(file)));
}

runGate('check-magic-numbers', {
  check: checkMagicNumbers,
  selftest: () =>
    withTempDir((dir) => {
      const file = join(dir, 'game/src/domain/selftest-wrong.ts');
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, 'export const LIMIT_M = 500;\nexport function slow(speed: number) {\n  return speed * 0.75;\n}\n');
      return checkMagicNumbers(dir);
    }),
});
