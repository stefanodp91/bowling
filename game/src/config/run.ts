/**
 * Run tunables (wiki/game/run.md, rule 9). Metres, seconds, m/s. The run's pure step, the
 * autopilot, the track gate and the scene import them; nothing else repeats these numbers.
 */
import { BALL_RADIUS_M } from '@models/measures/ball';
import { LANE_LENGTH_M } from '@models/measures/lane';
import { PROP_SCALE } from '@models/measures/scale';

/** The countdown before rolling starts by itself (rule 1). */
export const READY_S = 1.5;
/**
 * The throw (rule 3): the ball leaves the hand at 10 m/s, 36 km/h — the «slow» profile a human
 * chose on 2026-10-28, near a real bowler's 7.6–8.5 m/s release (see the page's references).
 */
export const RELEASE_SPEED_MPS = 10;
/** The arm swing: from rest to the release speed in 0.8 s, eased out (rule 3; design). */
export const LAUNCH_S = 0.8;
/**
 * A clean ball reaches the pin deck at 6 m/s, 22 km/h (rule 3, the human's «slow» profile): the
 * lane's drag takes 4 m/s over the run, as a real ball loses a few mph before the pins.
 */
export const PIN_SPEED_MPS = 6;
/**
 * The lane's drag stops slowing a ball below 3 m/s, so a ball slowed by impacts still reaches the
 * pins instead of stopping on the lane (rule 3; design).
 */
export const MIN_ROLL_SPEED_MPS = 3;
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
