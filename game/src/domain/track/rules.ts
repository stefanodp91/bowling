import { LANE_INDICES } from '@models/measures/lane';
import { LONGEST_MANOEUVRE_S, MAX_SPEED_MPS } from '../../config/run';
import {
  APPROACH_START_Z_M,
  GAP_END_M,
  GAP_JITTER_M,
  GAP_START_M,
  MIN_REACTION_S,
  PASSABLE_WINDOW_M,
  START_CLEAR_M,
  SWEEP_BAR_CLEAR_M,
} from '../../config/track';
import { extentOf, type Extent } from './extent';
import type { Obstacle, Track } from './schema';

/** One broken rule: which obstacle (index in the file) and what is wrong. */
export interface Violation {
  readonly index: number;
  readonly rule: 'clear-zone' | 'spacing' | 'passable' | 'sweep-clearance' | 'time-to-act' | 'order';
  readonly message: string;
}

/** Floating-point slack when comparing distances, metres. */
const EPSILON_M = 1e-6;

/** The expected gap after an obstacle that ends at z: linear from GAP_START_M to GAP_END_M. */
export function expectedGap(z: number): number {
  const fraction = Math.min(1, Math.max(0, (z - START_CLEAR_M) / (APPROACH_START_Z_M - START_CLEAR_M)));
  return GAP_START_M + (GAP_END_M - GAP_START_M) * fraction;
}

/** The shortest gap that still leaves time to act at full speed (rule 6, «time to act»). */
export const MIN_ACTION_GAP_M = (LONGEST_MANOEUVRE_S + MIN_REACTION_S) * MAX_SPEED_MPS;

interface Placed {
  readonly index: number;
  readonly obstacle: Obstacle;
  readonly extent: Extent;
}

function clearZones(placed: readonly Placed[]): Violation[] {
  return placed.flatMap(({ index, extent }) => {
    const problems: Violation[] = [];
    if (extent.startZ < START_CLEAR_M - EPSILON_M) problems.push({ index, rule: 'clear-zone', message: `met at ${extent.startZ.toFixed(1)} m, inside the first ${START_CLEAR_M} m` });
    if (extent.endZ > APPROACH_START_Z_M + EPSILON_M) problems.push({ index, rule: 'clear-zone', message: `ends at ${extent.endZ.toFixed(1)} m, inside the approach zone (after ${APPROACH_START_Z_M} m)` });
    return problems;
  });
}

function spacing(placed: readonly Placed[]): Violation[] {
  return placed.slice(1).flatMap((current, i) => {
    const previous = placed[i];
    if (previous === undefined) return [];
    const gap = current.extent.startZ - previous.extent.endZ;
    const expected = expectedGap(previous.extent.endZ);
    const problems: Violation[] = [];
    if (Math.abs(gap - expected) > GAP_JITTER_M + EPSILON_M) {
      problems.push({ index: current.index, rule: 'spacing', message: `gap ${gap.toFixed(1)} m after obstacle ${previous.index}, expected ${expected.toFixed(1)} ± ${GAP_JITTER_M} m` });
    }
    if (gap < MIN_ACTION_GAP_M - EPSILON_M) {
      problems.push({ index: current.index, rule: 'time-to-act', message: `gap ${gap.toFixed(1)} m gives ${(gap / MAX_SPEED_MPS).toFixed(2)} s at ${MAX_SPEED_MPS} m/s, less than ${(MIN_ACTION_GAP_M / MAX_SPEED_MPS).toFixed(2)} s` });
    }
    return problems;
  });
}

function passable(placed: readonly Placed[]): Violation[] {
  const laneObstacles = placed.filter((p) => p.extent.lanes !== 'all');
  return laneObstacles.flatMap((anchor) => {
    const windowStart = anchor.extent.startZ;
    const windowEnd = windowStart + PASSABLE_WINDOW_M;
    const blocked = new Set(
      laneObstacles
        .filter((p) => p.extent.startZ <= windowEnd + EPSILON_M && p.extent.endZ >= windowStart - EPSILON_M)
        .flatMap((p) => (p.extent.lanes === 'all' ? [] : p.extent.lanes)),
    );
    return LANE_INDICES.every((lane) => blocked.has(lane))
      ? [{ index: anchor.index, rule: 'passable' as const, message: `all three lanes blocked between ${windowStart.toFixed(1)} and ${windowEnd.toFixed(1)} m` }]
      : [];
  });
}

function sweepClearance(placed: readonly Placed[]): Violation[] {
  return placed
    .filter((p) => p.obstacle.kind === 'sweep-bar')
    .flatMap((sweep) =>
      placed
        .filter((other) => other !== sweep)
        .filter((other) => other.extent.endZ > sweep.extent.startZ - SWEEP_BAR_CLEAR_M + EPSILON_M && other.extent.startZ < sweep.extent.endZ + SWEEP_BAR_CLEAR_M - EPSILON_M)
        .map((other) => ({ index: sweep.index, rule: 'sweep-clearance' as const, message: `obstacle ${other.index} is within ${SWEEP_BAR_CLEAR_M} m of the sweep bar` })),
    );
}

/** Every rule of wiki/track/track-format.md, rule 6, on a validated track. Empty = solvable. */
export function trackViolations(track: Track): Violation[] {
  const placed = track.obstacles.map((obstacle, index) => ({ index, obstacle, extent: extentOf(obstacle) }));
  const ordered = [...placed].sort((a, b) => a.extent.startZ - b.extent.startZ);
  const order = placed.some((p, i) => ordered[i] !== p)
    ? [{ index: 0, rule: 'order' as const, message: 'obstacles are not listed in the order the ball meets them' }]
    : [];
  return [...order, ...clearZones(ordered), ...spacing(ordered), ...passable(ordered), ...sweepClearance(ordered)];
}
