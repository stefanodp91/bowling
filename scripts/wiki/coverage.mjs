// Which wiki pages cover a file: those whose canonical lists the file or one of its parent folders.
import { loadWiki, specPages, wikiDirOf } from './parse.mjs';

const normalise = (path) => path.replace(/^\.\//, '').replace(/\/$/, '');

export function covers(canonicalEntry, file) {
  const entry = normalise(canonicalEntry);
  const target = normalise(file);
  return target === entry || target.startsWith(`${entry}/`);
}

export function pagesCovering(root, files) {
  return specPages(loadWiki(wikiDirOf(root))).filter((page) =>
    files.some((file) => (page.frontMatter.canonical ?? []).some((entry) => covers(entry, file))),
  );
}

export const describePage = (page) => `wiki/${page.path} — ${page.frontMatter.title} · ${page.frontMatter.status}`;
