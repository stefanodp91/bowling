/**
 * The bowler's swing shown during the countdown (wiki/game/run.md, rule 3, «The throw»). Seconds,
 * metres, radians. Only the scene reads these: the run stays at the foul line until the release.
 */
import { PROP_SCALE } from '@models/measures/scale';
import { READY_S, RELEASE_SPEED_MPS } from './run';

/** Shoulder to the ball's centre, a straight arm: ≈ 0.65 m on an adult (design), × PROP_SCALE like the ball. */
export const ARM_LENGTH_M = 0.65 * PROP_SCALE;
/** The swing's three moves: the ball held in front, the backswing, the forward swing to the release. */
export const ADDRESS_S = 0.3;
export const BACKSWING_S = 0.6;
export const FORWARD_SWING_S = READY_S - ADDRESS_S - BACKSWING_S;
/** At address the arm hangs a little forward of the shoulder, 20° (design; forward is negative). */
export const ADDRESS_ANGLE_RAD = -0.35;
/**
 * The top of the backswing. The forward swing eases in as u³, so the ball reaches the foul line at
 * 3 · arm · angle / time: the angle is chosen so that this is the release speed, and the ball
 * leaves the hand as fast as the run then rolls it (≈ 88°).
 */
export const BACKSWING_ANGLE_RAD = (RELEASE_SPEED_MPS * FORWARD_SWING_S) / (3 * ARM_LENGTH_M);
