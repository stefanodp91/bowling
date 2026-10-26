import type { LaneIndex } from '@models/measures/lane';
import { cleanRunTimeTo } from '../run/speed';
import type { Obstacle } from './schema';

/** Where an obstacle is met along the lane, and which lanes it blocks there. */
export interface Extent {
  readonly startZ: number;
  readonly endZ: number;
  /** The travel lanes it blocks; the sweep bar blocks every lane but can be jumped. */
  readonly lanes: readonly LaneIndex[] | 'all';
}

/** Bisection steps for the meeting point: 60 halvings of 500 m is far below a millimetre. */
const BISECTION_STEPS = 60;

/**
 * Where a clean run meets a returning ball that starts at z0 at the start of the run and rolls
 * towards the foul line at speedMps: the z where z0 − v·t(z) = z.
 */
export function meetingZ(z0: number, speedMps: number): number {
  let low = 0;
  let high = z0;
  for (let i = 0; i < BISECTION_STEPS; i += 1) {
    const mid = (low + high) / 2;
    if (z0 - speedMps * cleanRunTimeTo(mid) > mid) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

/** The starting z of a returning ball that a clean run meets at meetZ. */
export function returningBallStartZ(meetZ: number, speedMps: number): number {
  return meetZ + speedMps * cleanRunTimeTo(meetZ);
}

export function extentOf(obstacle: Obstacle): Extent {
  switch (obstacle.kind) {
    case 'sweep-bar':
      return { startZ: obstacle.z, endZ: obstacle.z, lanes: 'all' };
    case 'widening-gutter':
      return { startZ: obstacle.z, endZ: obstacle.z + obstacle.lengthM, lanes: [obstacle.lane] };
    case 'returning-ball': {
      const met = meetingZ(obstacle.z, obstacle.speedMps);
      return { startZ: met, endZ: met, lanes: [obstacle.lane] };
    }
    case 'stray-pins':
    case 'rental-shoes':
      return { startZ: obstacle.z, endZ: obstacle.z, lanes: [obstacle.lane] };
  }
}
