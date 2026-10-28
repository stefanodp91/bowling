import { LANE_INDICES, LANE_LENGTH_M, TRAVEL_LANES, type LaneIndex } from '@models/measures/lane';
import {
  APPROACH_START_Z_M,
  GAP_JITTER_M,
  OBSTACLE_WEIGHTS,
  RETURNING_BALL_SPEED_MPS,
  START_CLEAR_M,
  TRACK_SCHEMA_VERSION,
  WIDENING_GUTTER_LENGTH_M,
} from '../../config/track';
import { uniform, type RandomSource } from '../random';
import { returningBallStartZ } from './extent';
import { expectedGap } from './rules';
import { OBSTACLE_KINDS, type Obstacle, type ObstacleKind, type Track } from './schema';

/** Positions in the files are rounded to the centimetre, so re-baking is byte-identical and readable. */
const DECIMALS = 2;
const round = (x: number): number => Number(x.toFixed(DECIMALS));
/**
 * The jitter stays this far inside ± GAP_JITTER_M, so rounding positions to the centimetre (and
 * recomputing a returning ball's meeting point from its rounded start) never pushes a gap outside
 * the rule the gate checks.
 */
const ROUNDING_SLACK_M = 0.05;

function drawKind(random: RandomSource): ObstacleKind {
  const total = OBSTACLE_KINDS.reduce((sum, kind) => sum + OBSTACLE_WEIGHTS[kind], 0);
  let ticket = random() * total;
  for (const kind of OBSTACLE_KINDS) {
    ticket -= OBSTACLE_WEIGHTS[kind];
    if (ticket < 0) return kind;
  }
  return OBSTACLE_KINDS[0];
}

function drawLane(random: RandomSource): LaneIndex {
  return LANE_INDICES[Math.min(TRAVEL_LANES - 1, Math.floor(random() * TRAVEL_LANES))] ?? LANE_INDICES[0];
}

/** One obstacle of `kind` met at z; returns it and where it ends along the lane. */
function place(kind: ObstacleKind, z: number, random: RandomSource): { obstacle: Obstacle; endZ: number } {
  switch (kind) {
    case 'soda-cans':
      return { obstacle: { kind, z: round(z) }, endZ: round(z) };
    case 'widening-gutter': {
      const lengthM = round(uniform(random, WIDENING_GUTTER_LENGTH_M.min, WIDENING_GUTTER_LENGTH_M.max));
      return { obstacle: { kind, lane: drawLane(random), z: round(z), lengthM }, endZ: round(z) + lengthM };
    }
    case 'returning-ball': {
      const speedMps = round(uniform(random, RETURNING_BALL_SPEED_MPS.min, RETURNING_BALL_SPEED_MPS.max));
      return { obstacle: { kind, lane: drawLane(random), z: round(returningBallStartZ(z, speedMps)), speedMps }, endZ: z };
    }
    case 'wet-floor-sign':
    case 'rental-shoes':
      return { obstacle: { kind, lane: drawLane(random), z: round(z) }, endZ: round(z) };
  }
}

/**
 * A track from its seed (wiki/track/track-format.md, rule 5): obstacles from START_CLEAR_M to the
 * approach zone, gaps shrinking from GAP_START_M to GAP_END_M with a seeded jitter. Pure: the
 * random source is injected, so the same seed gives the same track.
 */
export function generateTrack(trackId: string, seed: number, random: RandomSource): Track {
  const obstacles: Obstacle[] = [];
  const jitter = (): number => uniform(random, -(GAP_JITTER_M - ROUNDING_SLACK_M), GAP_JITTER_M - ROUNDING_SLACK_M);
  // The first obstacle keeps the rounding slack from the clear zone, as every gap does from its rule.
  let z = START_CLEAR_M + ROUNDING_SLACK_M + Math.abs(jitter());
  for (;;) {
    const { obstacle, endZ } = place(drawKind(random), z, random);
    if (endZ > APPROACH_START_Z_M) break;
    obstacles.push(obstacle);
    z = endZ + expectedGap(endZ) + jitter();
  }
  return { schemaVersion: TRACK_SCHEMA_VERSION, trackId, seed, lengthM: LANE_LENGTH_M, lanes: TRAVEL_LANES, obstacles };
}
