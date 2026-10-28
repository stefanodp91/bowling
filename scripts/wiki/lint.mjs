// npm run wiki:lint (wiki/method/wiki-tooling.md, rule 1), in order: front matter against
// wiki/SCHEMA.md, relative links, depends_on and canonical paths, index freshness,
// check-acceptance, agents-lint. --selftest breaks a fixture wiki once per check.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { finding, runGate, withTempDir } from '../lib/gate.mjs';
import { acceptanceFindings, acceptanceSelftest } from './check-acceptance.mjs';
import { agentsFindings, agentsSelftest } from './agents-lint.mjs';
import { writeFixtureWiki } from './fixture.mjs';
import { indexFindings, indexSelftest } from './index.mjs';
import { INDEX_PAGE, loadWiki, wikiDirOf } from './parse.mjs';

const TYPES = new Set(['spec', 'concept', 'record']);
const STATUSES = new Set(['planned', 'built', 'approved']);
const SPEC_ONLY = ['status', 'depends_on', 'canonical'];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function frontMatterFindings(page) {
  const where = `wiki/${page.path}`;
  const fm = page.frontMatter;
  if (fm === undefined) return [finding(where, 1, 'no front matter (wiki/SCHEMA.md)')];
  const problems = [];
  const add = (message) => problems.push(finding(where, undefined, message));
  if (!fm.title) add('front matter: missing title');
  if (!TYPES.has(fm.type)) add(`front matter: type must be spec, concept or record, got «${fm.type}»`);
  if (!ISO_DATE.test(fm.verified ?? '')) add('front matter: verified must be a yyyy-mm-dd date');
  if (fm.type === 'spec') {
    if (!STATUSES.has(fm.status)) add(`front matter: status must be planned, built or approved, got «${fm.status}»`);
    if (!Array.isArray(fm.depends_on)) add('front matter: depends_on must be a list');
    if (!Array.isArray(fm.canonical)) add('front matter: canonical must be a list');
  } else {
    for (const key of SPEC_ONLY) if (key in fm) add(`front matter: ${key} is for spec pages only`);
  }
  if (fm.status === 'approved' && !ISO_DATE.test(fm.approved_on ?? '')) add('front matter: approved needs approved_on (written by a human)');
  if ('approved_on' in fm && fm.status !== 'approved') add('front matter: approved_on only with status: approved');
  return problems;
}

/** Markdown links outside code: `[text](target)` whose target is a relative path. */
function linkFindings(root, page) {
  const withoutCode = page.text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  return [...withoutCode.matchAll(/\]\(([^)\s]+)\)/g)]
    .map((m) => m[1])
    .filter((target) => !/^[a-z]+:/i.test(target) && !target.startsWith('#'))
    .filter((target) => !existsSync(join(root, 'wiki', dirname(page.path), target.split('#')[0])))
    .map((target) => finding(`wiki/${page.path}`, undefined, `broken link «${target}»`));
}

function pathFindings(root, page, pagePaths) {
  const fm = page.frontMatter;
  if (fm?.type !== 'spec') return [];
  const where = `wiki/${page.path}`;
  const deps = (fm.depends_on ?? []).filter((d) => !pagePaths.has(d)).map((d) => finding(where, undefined, `depends_on «${d}» is not a page`));
  const canon = (fm.canonical ?? []).filter((c) => !existsSync(join(root, c))).map((c) => finding(where, undefined, `canonical «${c}» does not exist`));
  const empty = fm.status !== 'planned' && (fm.canonical ?? []).length === 0 ? [finding(where, undefined, `canonical is empty but status is ${fm.status}`)] : [];
  return [...deps, ...canon, ...empty];
}

export function lintWiki(root) {
  const pages = loadWiki(wikiDirOf(root)).filter((p) => p.path !== INDEX_PAGE);
  const pagePaths = new Set(pages.map((p) => p.path));
  const own = [
    ...pages.flatMap(frontMatterFindings),
    ...loadWiki(wikiDirOf(root)).flatMap((p) => linkFindings(root, p)),
    ...pages.flatMap((p) => pathFindings(root, p, pagePaths)),
  ];
  if (own.length > 0) return own; // the index cannot be rendered from broken front matter
  return [...indexFindings(root), ...acceptanceFindings(root), ...agentsFindings(root)];
}

/** Each broken case: how to break the fixture. Every one must be rejected. */
const BROKEN_CASES = {
  'missing front matter field': (dir) => edit(dir, 'wiki/concept.md', (t) => t.replace('title: Concept fixture\n', '')),
  'broken link': (dir) => edit(dir, 'wiki/concept.md', (t) => `${t}\nSee [nowhere](missing/page.md).\n`),
  'missing canonical file': (dir) => edit(dir, 'wiki/game/run.md', (t) => t.replace('game/src/domain/run.ts', 'game/src/domain/gone.ts')),
};

function edit(dir, path, change) {
  writeFileSync(join(dir, path), change(readFileSync(join(dir, path), 'utf8')));
}

function lintSelftest() {
  const rejected = Object.entries(BROKEN_CASES).flatMap(([name, breakIt]) =>
    withTempDir((dir) => {
      writeFixtureWiki(dir);
      breakIt(dir);
      const found = lintWiki(dir);
      return found.length > 0 ? found.map((f) => ({ ...f, message: `[${name}] ${f.message}` })) : [];
    }),
  );
  const delegated = [indexSelftest(), acceptanceSelftest(), agentsSelftest()];
  const allRejected = rejected.length >= Object.keys(BROKEN_CASES).length && delegated.every((f) => f.length > 0);
  return allRejected ? [...rejected, ...delegated.flat()] : [];
}


if (import.meta.url === `file://${process.argv[1]}`) {
  runGate('wiki:lint', { check: lintWiki, selftest: lintSelftest });
}
