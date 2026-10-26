// A small valid wiki written into a temporary directory, which each selftest then breaks.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ACCEPTANCE_HEADING, loadWiki, sectionText, sha256, wikiDirOf } from './parse.mjs';

const spec = (title, status, dependsOn, canonical) => `---
title: ${title}
type: spec
status: ${status}
depends_on: [${dependsOn.join(', ')}]
canonical: [${canonical.join(', ')}]
verified: 2026-10-26
---

# ${title}

> Boundary: fixture.

## Purpose

Fixture page, see [the other page](../concept.md).

## Rules

1. None.

## ${ACCEPTANCE_HEADING}

1. [auto] Something passes.

## References

## Rounds
`;

const FILES = {
  'AGENTS.md': '# AGENTS.md\n\nFixture.\n',
  'game/src/domain/run.ts': 'export const RUN = true;\n',
  'wiki/workspace/monorepo.md': spec('Workspace fixture', 'planned', [], []),
  'wiki/game/run.md': spec('Run fixture', 'built', ['workspace/monorepo.md'], ['game/src/domain/run.ts']),
  'wiki/concept.md': '---\ntitle: Concept fixture\ntype: concept\nverified: 2026-10-26\n---\n\n# Concept\n',
};

export function writeFixtureWiki(dir) {
  for (const [path, text] of Object.entries(FILES)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  const pages = loadWiki(wikiDirOf(dir));
  const lock = Object.fromEntries(
    pages.filter((p) => p.frontMatter?.type === 'spec').map((p) => [p.path, sha256(sectionText(p.body, ACCEPTANCE_HEADING))]),
  );
  writeFileSync(join(dir, 'wiki/acceptance.lock.json'), `${JSON.stringify(lock, null, 2)}\n`);
}
