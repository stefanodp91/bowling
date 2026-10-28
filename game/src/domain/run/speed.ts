import { DECK_HANDOFF_Z, LAUNCH_S, PIN_SPEED_MPS, RELEASE_SPEED_MPS } from '../../config/run';

/** The throw's ease-out, 1 − (1 − u)², averages two thirds of its end value over its duration. */
const EASE_OUT_MEAN = 2 / 3;
/** How far the throw carries the ball before the lane's drag takes over, metres (≈ 5.3 m). */
export const LAUNCH_DISTANCE_M = EASE_OUT_MEAN * RELEASE_SPEED_MPS * LAUNCH_S;
/**
 * The lane's drag (rule 3): the share of its speed the ball loses per metre rolled, so a clean ball
 * goes from the release speed to PIN_SPEED_MPS between the end of the throw and the hand-over.
 * Per metre it is dv/dz = −k·v; in time, dv/dt = −k·v², a drag that bites hard on a fast ball and
 * gently on a slow one — a ball slowed by an impact keeps rolling instead of crawling.
 */
export const ROLL_DRAG_PER_M = Math.log(RELEASE_SPEED_MPS / PIN_SPEED_MPS) / (DECK_HANDOFF_Z - LAUNCH_DISTANCE_M);
/** Halvings that pin a throw's time to well under a simulation step (2⁻⁴⁰ of LAUNCH_S). */
const BISECTION_STEPS = 40;

/** Speed during the throw, `runS` seconds after rolling began: eased out from rest (rule 3). */
export function launchSpeed(runS: number): number {
  const u = Math.min(1, Math.max(0, runS / LAUNCH_S));
  return RELEASE_SPEED_MPS * (1 - (1 - u) ** 2);
}

/**
 * Target speed at distance z (rule 3): the speed of a clean ball once thrown — the release speed,
 * decaying exponentially in distance from the end of the throw. Never increasing in z; the actual
 * speed never exceeds it (the throw starts below it, impacts only take speed away).
 */
export function targetSpeed(z: number): number {
  return RELEASE_SPEED_MPS * Math.exp(-ROLL_DRAG_PER_M * Math.max(0, z - LAUNCH_DISTANCE_M));
}

/** The throw's speed is v₀·(2u − u²); its integral, u² − u³/3, has this power and divisor. */
const CUBIC = 3;

/** Distance the throw has covered `runS` seconds after rolling began: the integral of launchSpeed. */
function launchDistance(runS: number): number {
  const u = Math.min(1, Math.max(0, runS / LAUNCH_S));
  return RELEASE_SPEED_MPS * LAUNCH_S * (u ** 2 - u ** CUBIC / CUBIC);
}

/**
 * Time a clean run (no impact) needs from the foul line to z, seconds: the throw, then
 * v(z) = v₀·e^(−k·d), so dt = dz / v gives t = (e^(k·d) − 1) / (k·v₀). Used to place a returning
 * ball where a clean run meets it, and to start a run already at z (the `at` query parameter).
 */
export function cleanRunTimeTo(z: number): number {
  if (z >= LAUNCH_DISTANCE_M) return LAUNCH_S + Math.expm1(ROLL_DRAG_PER_M * (z - LAUNCH_DISTANCE_M)) / (ROLL_DRAG_PER_M * RELEASE_SPEED_MPS);
  let [low, high] = [0, LAUNCH_S];
  for (let i = 0; i < BISECTION_STEPS; i += 1) {
    const mid = (low + high) / 2;
    if (launchDistance(mid) < z) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}
