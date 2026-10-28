import { DECK_HANDOFF_Z, PIN_SPEED_MPS, RELEASE_SPEED_MPS } from '../../config/run';

/**
 * The lane's drag (rule 3): the share of its speed a clean ball loses per metre rolled, so it goes
 * from the release speed at the foul line to PIN_SPEED_MPS at the hand-over. Per metre it is
 * dv/dz = −k·v; in time, dv/dt = −k·v², a drag that bites hard on a fast ball and gently on a slow
 * one.
 */
export const ROLL_DRAG_PER_M = Math.log(RELEASE_SPEED_MPS / PIN_SPEED_MPS) / DECK_HANDOFF_Z;

/**
 * Target speed at distance z (rule 3): the speed of a clean ball — the release speed, decaying
 * exponentially in distance. Never increasing in z; the actual speed never exceeds it (impacts only
 * take speed away, and a slowed ball recovers up to it, not past it).
 */
export function targetSpeed(z: number): number {
  return RELEASE_SPEED_MPS * Math.exp(-ROLL_DRAG_PER_M * Math.max(0, z));
}

/**
 * Time a clean run (no impact) needs from the foul line to z, seconds: v(z) = v₀·e^(−k·z), so
 * dt = dz / v gives t = (e^(k·z) − 1) / (k·v₀). Used to place a returning ball where a clean run
 * meets it, and to start a run already at z (the `at` query parameter).
 */
export function cleanRunTimeTo(z: number): number {
  return Math.expm1(ROLL_DRAG_PER_M * Math.max(0, z)) / (ROLL_DRAG_PER_M * RELEASE_SPEED_MPS);
}
