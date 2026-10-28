// Extracts the module specifiers a TypeScript/JavaScript file imports, with their line numbers.
import ts from 'typescript';

export function importsOf(fileName, text) {
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);
  const found = [];
  const visit = (node) => {
    const isImportLike =
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier !== undefined &&
      ts.isStringLiteral(node.moduleSpecifier);
    if (isImportLike) {
      found.push({ specifier: node.moduleSpecifier.text, line: lineOf(source, node) });
    }
    const isDynamic =
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] !== undefined &&
      ts.isStringLiteral(node.arguments[0]);
    if (isDynamic) found.push({ specifier: node.arguments[0].text, line: lineOf(source, node) });
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

export function lineOf(source, node) {
  return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
}
