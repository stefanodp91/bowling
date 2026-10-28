import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/**
 * wiki/game/hud.md, criterion 2: no .tsx under game/src/ui renders a string literal as text (every
 * visible string goes through i18n) or uses a style= prop (styles live in *.module.css).
 */
function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return tsxFiles(path);
    return path.endsWith('.tsx') && !path.endsWith('.test.tsx') ? [path] : [];
  });
}

export function violationsIn(fileName: string, text: string): string[] {
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found: string[] = [];
  const line = (node: ts.Node) => source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
  const visit = (node: ts.Node): void => {
    if (ts.isJsxText(node) && node.text.trim().length > 0) found.push(`${fileName}:${line(node)}: text «${node.text.trim()}»`);
    const isTextExpression = ts.isJsxExpression(node) && ts.isJsxElement(node.parent);
    if (isTextExpression && node.expression !== undefined && (ts.isStringLiteral(node.expression) || ts.isNoSubstitutionTemplateLiteral(node.expression))) {
      found.push(`${fileName}:${line(node)}: string literal rendered as text`);
    }
    if (ts.isJsxAttribute(node) && node.name.getText(source) === 'style') found.push(`${fileName}:${line(node)}: style= prop`);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

describe('ui rules', () => {
  it('no literal text and no style= prop in game/src/ui', () => {
    const root = new URL('.', import.meta.url).pathname;
    expect(tsxFiles(root).flatMap((file) => violationsIn(file, readFileSync(file, 'utf8')))).toEqual([]);
  });

  it('catches both kinds of violation', () => {
    expect(violationsIn('x.tsx', 'const A = () => <p>Hello</p>;')).toHaveLength(1);
    expect(violationsIn('x.tsx', "const A = () => <p>{'Hello'}</p>;")).toHaveLength(1);
    expect(violationsIn('x.tsx', 'const A = () => <p style={{}} />;')).toHaveLength(1);
  });
});
