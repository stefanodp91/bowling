// One run of the real game in headless Chromium, read through window.__bowling until the result
// (wiki/pilot/headless-runs.md, rule 1). Shares the browser setup of the shot tool.
import { openPage } from '../headless/browser.mjs';

/** Steps per rendered frame by default: a run of ~6 000 steps renders in ~100 frames. */
export const DEFAULT_SPEEDUP = 60;
/** The longest a run may take on the wall clock before it counts as stuck. */
const RUN_TIMEOUT_MS = 180_000;

/**
 * Plays one run and returns its JSON line. `route` (optional) lets a caller replace a track file in
 * flight — check-pilot's selftest serves an impossible track that way.
 */
export async function runInBrowser(browser, base, { track, skill, seed, speedup = DEFAULT_SPEEDUP, blind = false, route }) {
  const { page, errors } = await openPage(browser, { width: 960, height: 540 });
  try {
    if (route !== undefined) await page.route(route.url, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: route.body }));
    const params = new URLSearchParams({ track, skill, speedup: String(speedup), ...(seed === undefined ? {} : { seed: String(seed) }), ...(blind ? { pilot: 'blind' } : {}) });
    const started = Date.now();
    await page.goto(`${base}/?${params}`);
    let reached = true;
    await page
      .waitForFunction(() => window.__bowling?.snapshot().phase === 'result', undefined, { timeout: RUN_TIMEOUT_MS, polling: 100 })
      .catch(() => {
        reached = false;
      });
    const snapshot = await page.evaluate(() => window.__bowling?.snapshot() ?? null);
    const stats = await page.evaluate(() => window.__bowling?.renderStats() ?? null);
    return {
      track,
      skill: blind ? 'blind' : skill,
      seed: snapshot?.seed ?? seed ?? null,
      reachedResult: reached,
      simulatedS: snapshot?.runS ?? null,
      wallS: (Date.now() - started) / 1000,
      impacts: snapshot?.impacts ?? null,
      speedAtHandOffMps: snapshot?.handOffSpeedMps ?? null,
      aimErrorM: snapshot?.aimErrorM ?? null,
      pinsDown: snapshot?.score ?? null,
      averageFrameMs: stats?.averageFrameMs ?? null,
      worstFrameMs: stats?.worstFrameMs ?? null,
      peakActiveMeshes: stats?.peakActiveMeshes ?? null,
      consoleErrors: errors,
    };
  } finally {
    await page.close();
  }
}
