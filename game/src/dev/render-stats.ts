/**
 * Frame statistics for headless tools (wiki/pilot/headless-runs.md, rule 1): the scene reports each
 * rendered frame, window.__bowling reads the totals. Nothing in the game reads them back.
 */
export interface RenderStats {
  readonly frames: number;
  readonly averageFrameMs: number;
  readonly worstFrameMs: number;
  readonly peakActiveMeshes: number;
}

let frames = 0;
let totalMs = 0;
let worstMs = 0;
let peakMeshes = 0;

export function recordFrame(frameMs: number, activeMeshes: number): void {
  frames += 1;
  totalMs += frameMs;
  worstMs = Math.max(worstMs, frameMs);
  peakMeshes = Math.max(peakMeshes, activeMeshes);
}

export function renderStats(): RenderStats {
  return { frames, averageFrameMs: frames === 0 ? 0 : totalMs / frames, worstFrameMs: worstMs, peakActiveMeshes: peakMeshes };
}
