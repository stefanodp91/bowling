// npm run pilot -- [--tracks all|<ids>] [--skill perfect|good|sloppy] [--runs <n>] [--speedup <k>] [--blind]
// Runs the real game headlessly, driven by the autopilot (or the blind baseline), one JSON line per
// run and a summary table at the end (wiki/pilot/headless-runs.md, rule 1).
import { launchBrowser } from '../headless/browser.mjs';
import { ensureServer } from '../headless/servers.mjs';
import { DEFAULT_SPEEDUP, runInBrowser } from './browser-run.mjs';
import { committedTrackIds, predict } from './simulate.mjs';

function parseArgs(argv) {
  const value = (name, fallback) => {
    const i = argv.indexOf(`--${name}`);
    return i === -1 ? fallback : argv[i + 1];
  };
  const tracks = value('tracks', 'all');
  return {
    tracks: tracks === 'all' ? committedTrackIds() : tracks.split(','),
    skill: value('skill', 'perfect'),
    runs: Number(value('runs', '1')),
    speedup: Number(value('speedup', String(DEFAULT_SPEEDUP))),
    blind: argv.includes('--blind'),
  };
}

const mean = (xs) => (xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length);

export async function campaign({ tracks, skill, runs, speedup, blind }) {
  const server = await ensureServer('game');
  const browser = await launchBrowser();
  const lines = [];
  try {
    for (const track of tracks) {
      for (let i = 0; i < runs; i += 1) {
        const seed = i === 0 ? undefined : i;
        const line = await runInBrowser(browser, server.base, { track, skill, seed, speedup, blind });
        const predicted = blind ? null : predict(track, skill, line.seed ?? undefined);
        const withAgreement = { ...line, simulatedImpacts: predicted?.impacts ?? null, agreesWithSimulation: predicted === null ? null : predicted.impacts === line.impacts };
        console.log(JSON.stringify(withAgreement));
        lines.push(withAgreement);
      }
    }
  } finally {
    await browser.close();
    server.stop();
  }
  return lines;
}

export function summaryTable(lines) {
  const rows = ['| Track | Skill | Runs | Avg impacts | Avg pins down | Agrees with simulateRun |', '|---|---|---|---|---|---|'];
  const keys = [...new Set(lines.map((l) => `${l.track}\u0000${l.skill}`))];
  for (const key of keys) {
    const [track, skill] = key.split('\u0000');
    const group = lines.filter((l) => l.track === track && l.skill === skill);
    const agree = group.every((l) => l.agreesWithSimulation !== false) ? (group[0]?.agreesWithSimulation === null ? 'n/a' : 'yes') : 'NO';
    rows.push(`| ${track} | ${skill} | ${group.length} | ${mean(group.map((l) => l.impacts ?? 0)).toFixed(2)} | ${mean(group.map((l) => l.pinsDown ?? 0)).toFixed(2)} | ${agree} |`);
  }
  return rows.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const lines = await campaign(parseArgs(process.argv.slice(2)));
  console.log(`\n${summaryTable(lines)}`);
  if (lines.some((l) => !l.reachedResult || l.consoleErrors.length > 0)) process.exit(1);
}
