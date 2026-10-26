// The one parser of wiki pages (wiki/method/wiki-tooling.md, rule 6): front matter and sections.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rel, walk } from '../lib/gate.mjs';

/** The generated index has no front matter (wiki/SCHEMA.md, «Front matter»). */
export const INDEX_PAGE = 'index.md';
export const ACCEPTANCE_HEADING = 'Acceptance criteria';

/** Parses the YAML subset the wiki uses: `key: value` and `key: [a, b]`, one per line. */
export function parseFrontMatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (match === null) return { frontMatter: undefined, body: text };
  const frontMatter = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon <= 0) continue;
    const key = line.slice(0, colon).trim();
    const raw = line.slice(colon + 1).trim();
    frontMatter[key] = raw.startsWith('[') && raw.endsWith(']')
      ? raw.slice(1, -1).split(',').map((item) => item.trim()).filter((item) => item.length > 0)
      : raw;
  }
  return { frontMatter, body: text.slice(match[0].length) };
}

/** The text of a `## <heading>` section, up to the next `## ` heading, trimmed. */
export function sectionText(body, heading) {
  const lines = body.split('\n');
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return undefined;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith('## '));
  return (end === -1 ? rest : rest.slice(0, end)).join('\n').trim();
}

export function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

/** Every page under `wikiDir`: its path relative to the wiki, front matter, body and raw text. */
export function loadWiki(wikiDir) {
  return walk(wikiDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const text = readFileSync(file, 'utf8');
      return { path: rel(wikiDir, file), text, ...parseFrontMatter(text) };
    })
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

export function wikiDirOf(root) {
  return join(root, 'wiki');
}

export const specPages = (pages) => pages.filter((p) => p.frontMatter?.type === 'spec');
