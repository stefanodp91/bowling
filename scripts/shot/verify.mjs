// npm run shot:verify: the automatic criteria of wiki/tools/shot.md and wiki/storybook/catalog.md
// that need a browser — every story reaches data-ready within READY_TIMEOUT_MS, the placeholder
// shot is a real image, a missing story fails by name, and the game target once the game exists.
import { spawnSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from '../lib/gate.mjs';
import { launchBrowser, pixelOf } from '../headless/browser.mjs';
import { ensureServer } from '../headless/servers.mjs';
import { parseFrontMatter } from '../wiki/parse.mjs';
import { takeShot } from './shot.mjs';

/** A real shot is larger than this (wiki/tools/shot.md, criterion 1). */
const MIN_PNG_BYTES = 10 * 1024;
/** The catalogue background, from storybook/src/stage/stage-config.ts (STAGE_BACKGROUND_HEX). */
const STAGE_BACKGROUND = readFileSync(join(REPO_ROOT, 'storybook/src/stage/stage-config.ts'), 'utf8').match(/STAGE_BACKGROUND_HEX = '#([0-9A-F]{6})'/i)[1];
/** Per-channel tolerance when comparing a pixel with the background (PNG is exact; GL is not). */
const CHANNEL_TOLERANCE = 6;

const results = [];
const record = (name, ok, detail) => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const server = await ensureServer('storybook');
try {
  const index = await (await fetch(`${server.base}/index.json`)).json();
  const stories = Object.keys(index.entries).filter((id) => id.endsWith('--default')).map((id) => id.replace(/--default$/, ''));
  for (const story of stories) {
    const started = Date.now();
    try {
      const { file, png } = await takeShot({ target: `story:${story}` });
      record(`story:${story} ready`, true, `${((Date.now() - started) / 1000).toFixed(1)} s, ${file}`);
      if (story === 'models-placeholder') await checkPlaceholder(file, png);
    } catch (error) {
      record(`story:${story} ready`, false, error.message);
    }
  }

  const missing = spawnSync(process.execPath, [join(REPO_ROOT, 'scripts/shot/shot.mjs'), 'story:does-not-exist'], { encoding: 'utf8' });
  record('story:does-not-exist exits 1 naming the story', missing.status === 1 && missing.stderr.includes('does-not-exist'), missing.stderr.trim());
} finally {
  server.stop();
}

/** The game's fog and background colour, from game/src/config/camera.ts (FOG_HEX). */
const FOG = readFileSync(join(REPO_ROOT, 'game/src/config/camera.ts'), 'utf8').match(/FOG_HEX = '#([0-9A-F]{6})'/i)[1];
/** wiki/game/run.md criterion 3: the ball on the lane at 250 m. */
const GAME_AT_250 = 'game:track=lane-01&at=250&pause=1';

const run = parseFrontMatter(readFileSync(join(REPO_ROOT, 'wiki/game/run.md'), 'utf8')).frontMatter;
const runIsBuilt = run.status !== 'planned' || process.argv.includes('--game');
if (!runIsBuilt) {
  console.log('SKIP  game:pause=1 — the game page (wiki/game/run.md) is not built yet; criterion skipped, not passed');
} else {
  try {
    const { file } = await takeShot({ target: 'game:pause=1' });
    record('game:pause=1 writes a PNG', statSync(file).size > 0, file);
    const shot = await takeShot({ target: GAME_AT_250 });
    await checkNotBackground(`${GAME_AT_250}: centre region is not background`, shot.png, FOG);
  } catch (error) {
    record('game shots', false, error.message);
  }
}

/** Five pixels around the centre: the region is «not background» if most differ from `hex`. */
async function checkNotBackground(name, png, hex) {
  const browser = await launchBrowser();
  try {
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    const bg = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const offsets = [[0, 0], [-40, 0], [40, 0], [0, -40], [0, 40]];
    let differing = 0;
    for (const [dx, dy] of offsets) {
      const [r, g, b] = await pixelOf(browser, png, Math.floor(width / 2) + dx, Math.floor(height / 2) + dy);
      if (![r, g, b].every((c, i) => Math.abs(c - bg[i]) <= CHANNEL_TOLERANCE)) differing += 1;
    }
    record(name, differing > offsets.length / 2, `${differing}/${offsets.length} centre pixels differ from #${hex}`);
  } finally {
    await browser.close();
  }
}

async function checkPlaceholder(file, png) {
  const size = statSync(file).size;
  record('placeholder PNG larger than 10 KB', size > MIN_PNG_BYTES, `${size} bytes`);
  const browser = await launchBrowser();
  try {
    const { width, height } = { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
    const [r, g, b] = await pixelOf(browser, png, Math.floor(width / 2), Math.floor(height / 2));
    const bg = [0, 2, 4].map((i) => parseInt(STAGE_BACKGROUND.slice(i, i + 2), 16));
    const isBackground = [r, g, b].every((c, i) => Math.abs(c - bg[i]) <= CHANNEL_TOLERANCE);
    record('placeholder centre pixel is not the background', !isBackground, `rgb(${r}, ${g}, ${b}) vs #${STAGE_BACKGROUND}`);
  } finally {
    await browser.close();
  }
}

process.exit(results.every(Boolean) ? 0 : 1);
