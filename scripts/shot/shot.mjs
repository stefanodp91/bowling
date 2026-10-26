// npm run shot -- <target> [--size 1280x720] [--angle <name>] (wiki/tools/shot.md).
//   story:<story-id>  a catalogue story, e.g. story:models-ball (its «default» story)
//   game:<query>      the running game at /?<query>, e.g. game:track=lane-01&at=250&pause=1
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from '../lib/gate.mjs';
import { launchBrowser, openPage } from '../headless/browser.mjs';
import { ensureServer } from '../headless/servers.mjs';

/** Default image size, the size of a 720p projector frame. */
export const DEFAULT_SIZE = { width: 1280, height: 720 };
/** How long a page may take to say it is ready (wiki/storybook/catalog.md, criterion 2: 10 s). */
export const READY_TIMEOUT_MS = 10_000;
/** How long the first navigation may take while a server compiles on demand. */
const NAVIGATION_TIMEOUT_MS = 60_000;
export const SHOTS_DIR = join(REPO_ROOT, 'shots');
/** Every story file exports one story named Default: story:<id> opens <id>--default. */
const STORY_SUFFIX = '--default';

export class ShotError extends Error {}

function parseArgs(argv) {
  const [target, ...rest] = argv;
  const option = (name) => {
    const index = rest.indexOf(`--${name}`);
    return index === -1 ? undefined : rest[index + 1];
  };
  const sizeText = option('size');
  const size = sizeText === undefined ? DEFAULT_SIZE : parseSize(sizeText);
  return { target, size, angle: option('angle') };
}

function parseSize(text) {
  const match = /^(\d+)x(\d+)$/.exec(text);
  if (match === null) throw new ShotError(`--size must be WIDTHxHEIGHT, got «${text}»`);
  return { width: Number(match[1]), height: Number(match[2]) };
}

const timestamp = (date) => date.toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
const slug = (target) => target.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

async function storyUrl(base, id, angle) {
  const index = await (await fetch(`${base}/index.json`)).json();
  const storyId = id.includes('--') ? id : `${id}${STORY_SUFFIX}`;
  if (index.entries?.[storyId] === undefined) throw new ShotError(`story «${id}» does not exist in the catalogue (looked for ${storyId})`);
  const args = angle === undefined ? '' : `&args=angle:${angle}`;
  return `${base}/iframe.html?id=${storyId}&viewMode=story${args}`;
}

/** Opens the target, waits for its ready signal and writes the PNG. Returns its path and bytes. */
export async function takeShot({ target, size = DEFAULT_SIZE, angle }) {
  const [kind, ...restParts] = (target ?? '').split(':');
  const rest = restParts.join(':');
  if ((kind !== 'story' && kind !== 'game') || rest.length === 0 && kind === 'story') {
    throw new ShotError('usage: npm run shot -- story:<story-id>|game:<query> [--size WxH] [--angle <name>]');
  }
  const server = await ensureServer(kind === 'story' ? 'storybook' : 'game');
  const browser = await launchBrowser();
  try {
    const url = kind === 'story' ? await storyUrl(server.base, rest, angle) : `${server.base}/?${rest}`;
    const { page, errors } = await openPage(browser, size);
    await page.goto(url, { timeout: NAVIGATION_TIMEOUT_MS });
    const ready =
      kind === 'story'
        ? page.waitForSelector('[data-ready="true"]', { timeout: READY_TIMEOUT_MS })
        : page.waitForFunction(() => window.__bowling?.ready === true, undefined, { timeout: READY_TIMEOUT_MS });
    await ready.catch(() => {
      throw new ShotError(`«${target}» never became ready within ${READY_TIMEOUT_MS / 1000} s${errors.length ? `:\n  ${errors.join('\n  ')}` : ''}`);
    });
    if (errors.length > 0) throw new ShotError(`«${target}» logged errors:\n  ${errors.join('\n  ')}`);
    const png = await page.screenshot();
    mkdirSync(SHOTS_DIR, { recursive: true });
    const now = new Date();
    const file = join(SHOTS_DIR, `${slug(target)}${angle ? `-${angle}` : ''}-${timestamp(now)}.png`);
    writeFileSync(file, png);
    appendFileSync(join(SHOTS_DIR, 'shots.log'), `${now.toISOString()}\t${target}${angle ? ` --angle ${angle}` : ''}\t${file}\n`);
    return { file, png, browser };
  } finally {
    await browser.close();
    server.stop();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const { file } = await takeShot(parseArgs(process.argv.slice(2)));
    console.log(file);
  } catch (error) {
    console.error(error instanceof ShotError ? error.message : error);
    process.exit(1);
  }
}
