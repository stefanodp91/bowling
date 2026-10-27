/**
 * Run tunables (wiki/game/run.md, rule 9). Metres, seconds, m/s. The run's pure step, the
 * autopilot, the track gate and the scene import them; nothing else repeats these numbers.
 */
import { BALL_RADIUS_M } from '@models/measures/ball';
import { LANE_LENGTH_M } from '@models/measures/lane';
import { PROP_SCALE } from '@models/measures/scale';
import { APPROACH_START_Z_M } from './track';

/** The countdown before rolling starts by itself (rule 1). */
export const READY_S = 1.5;
/**
 * Speed at the foul line (rule 3): 3.7 m/s makes a clean run on the 300 m lane last 40 s —
 * 260 / (12 − 3.7) · ln(12 / 3.7) ≈ 36.9 s of acceleration plus 38 m at 12 m/s.
 */
export const START_SPEED_MPS = 3.7;
/** Speed from the start of the approach zone on (rule 3). */
export const MAX_SPEED_MPS = 12;
/** Target speed grows linearly with distance up to here: the start of the approach zone. */
export const MAX_SPEED_AT_Z_M = APPROACH_START_Z_M;
/** The most the actual speed can change towards the target, m/s² (rule 3). */
export const ACCEL_MPS2 = 1.5;
/** A lane change to the adjacent travel lane takes 0.25 s, eased (rule 4). */
export const LANE_CHANGE_S = 0.25;
/** A jump lasts 0.6 s (rule 5)… */
export const JUMP_AIRTIME_S = 0.6;
/** …and lifts the ball's lowest point 0.5 m × PROP_SCALE = 1 m at its apex, clearing the twice-life-size props (rule 5). */
export const JUMP_APEX_M = 0.5 * PROP_SCALE;
/** The longest manoeuvre, used by the track's time-to-act rule. */
export const LONGEST_MANOEUVRE_S = Math.max(LANE_CHANGE_S, JUMP_AIRTIME_S);
/** The ball is handed to physics 2 m before the head pin (rule 1). */
export const DECK_HANDOFF_BEFORE_PIN_M = 2;
export const DECK_HANDOFF_Z = LANE_LENGTH_M - DECK_HANDOFF_BEFORE_PIN_M;
/** The fixed simulation step: 1/120 s (rule 2). */
export const SIM_STEP_S = 1 / 120;
/** Ball radius, for rolling (ω = v / r, rule 6). */
export const BALL_ROLL_RADIUS_M = BALL_RADIUS_M;
