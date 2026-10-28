/**
 * Track tunables (wiki/track/track-format.md, rules 5 and 6). Metres and seconds. Every value that
 * decides where obstacles go lives here; the generator, the check-tracks gate and the autopilot
 * import them.
 */
import { LANE_LENGTH_M } from '@models/measures/lane';

/** No obstacle in the first 30 m: the run starts calm (rule 5). */
export const START_CLEAR_M = 30;
/** No obstacle in the last 40 m: the approach to the pins is free (rule 5). */
export const APPROACH_CLEAR_M = 40;
/** Where the approach zone starts: 40 m before the head pin. */
export const APPROACH_START_Z_M = LANE_LENGTH_M - APPROACH_CLEAR_M;

/** The gap between consecutive obstacles shrinks linearly from 25 m to 15 m (rule 5)… */
export const GAP_START_M = 25;
export const GAP_END_M = 15;
/** …plus a seeded jitter of ± 2 m. */
export const GAP_JITTER_M = 2;

/** Lane obstacles never block all three lanes within an 8 m window (rule 6). */
export const PASSABLE_WINDOW_M = 8;
/** A row of soda cans has 8 m free before and after it, to take off and land (rule 6). */
export const SODA_CANS_CLEAR_M = 8;

/**
 * The least time the pilot has between noticing an obstacle and starting to act: 0.35 s, the
 * sloppiest profile's notice time (wiki/pilot/autopilot.md, rule 5), so tracks and pilot cannot
 * drift apart (a test in the autopilot checks it).
 */
export const MIN_REACTION_S = 0.35;

/** How often each kind is drawn (design: signs and shoes common, the cans and gutter rarer). */
export const OBSTACLE_WEIGHTS = {
  'wet-floor-sign': 3,
  'rental-shoes': 2,
  'returning-ball': 2,
  'soda-cans': 1,
  'widening-gutter': 1,
} as const;

/** Speed range of a returning ball, m/s (design: slower than the player, readable on screen). */
export const RETURNING_BALL_SPEED_MPS = { min: 2, max: 4 } as const;
/** Length range of a widening gutter's full-depth channel, metres (design). */
export const WIDENING_GUTTER_LENGTH_M = { min: 10, max: 18 } as const;

/** The committed tracks: ids in play order and their seeds (rule 5). */
export const TRACK_SEEDS = {
  'lane-01': 1001,
  'lane-02': 1002,
  'lane-03': 1003,
  'lane-04': 1004,
  'lane-05': 1005,
} as const;

/** Version of the track file format (rule 3). */
export const TRACK_SCHEMA_VERSION = 1;
