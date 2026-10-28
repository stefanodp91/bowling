// check-pilot (check:full only): every committed track with `perfect`, in the real game in headless
// Chromium (wiki/pilot/headless-runs.md, rule 3). Fails on an impact, a run that never reaches the
// result, a console error, more active meshes than ACTIVE_MESH_BUDGET, or a disagreement with
// simulateRun on impacts. Thresholds are imported from the game's config.
import { ACTIVE_MESH_BUDGET } from '../../game/src/config/render.ts';
import { LANE_LENGTH_M } from '../../models/src/measures/lane.ts';
import { launchBrowser } from '../headless/browser.mjs';
import { ensureServer } from '../headless/servers.mjs';
import { finding, runGate } from '../lib/gate.mjs';
import { runInBrowser } from '../pilot/browser-run.mjs';
import { committedTrackIds, predict } from '../pilot/simulate.mjs';

function problemsOf(line, predictedImpacts) {
  const where = `game/public/tracks/${line.track}.json`;
  const problems = [];
  if (!line.reachedResult) problems.push(finding(where, undefined, 'the run never reached the result'));
  if (line.impacts !== 0) problems.push(finding(where, undefined, `perfect hit ${line.impacts} obstacle(s)`));
  for (const error of line.consoleErrors) problems.push(finding(where, undefined, `console error: ${error.slice(0, 200)}`));
  if ((line.peakActiveMeshes ?? 0) > ACTIVE_MESH_BUDGET) problems.push(finding(where, undefined, `${line.peakActiveMeshes} active meshes, over the budget of ${ACTIVE_MESH_BUDGET} (game/src/config/render.ts)`));
  if (predictedImpacts !== null && line.impacts !== predictedImpacts) problems.push(finding(where, undefined, `browser ${line.impacts} impacts, simulateRun ${predictedImpacts}`));
  return problems;
}

async function checkTracks(tracks, route) {
  const server = await ensureServer('game');
  const browser = await launchBrowser();
  try {
    const problems = [];
    for (const track of tracks) {
      const line = await runInBrowser(browser, server.base, { track, skill: 'perfect', ...(route === undefined ? {} : { route }) });
      problems.push(...problemsOf(line, route === undefined ? predict(track, 'perfect').impacts : null));
    }
    return problems;
  } finally {
    await browser.close();
    server.stop();
  }
}

/** An impossible track: wet floor signs across all three lanes at the same z, so even `perfect` hits. */
const IMPOSSIBLE = {
  schemaVersion: 1,
  trackId: 'lane-01',
  seed: 1,
  lengthM: LANE_LENGTH_M,
  lanes: 3,
  obstacles: [0, 1, 2].map((lane) => ({ kind: 'wet-floor-sign', lane, z: 100 })),
};

// runGate is synchronous: run the async check first, then hand its findings over.
const selftest = process.argv.includes('--selftest');
const findings = selftest
  ? await checkTracks(['lane-01'], { url: '**/tracks/lane-01.json', body: JSON.stringify(IMPOSSIBLE) })
  : await checkTracks(committedTrackIds());
runGate('check-pilot', { check: () => findings, selftest: () => findings });
