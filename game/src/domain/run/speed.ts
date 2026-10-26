import { MAX_SPEED_AT_Z_M, MAX_SPEED_MPS, START_SPEED_MPS } from '../../config/run';

/** Target speed at distance z: linear from START_SPEED_MPS at z = 0 to MAX_SPEED_MPS, then flat. */
export function targetSpeed(z: number): number {
  const fraction = Math.min(1, Math.max(0, z / MAX_SPEED_AT_Z_M));
  return START_SPEED_MPS + (MAX_SPEED_MPS - START_SPEED_MPS) * fraction;
}

/**
 * Time a clean run (no impact, speed always at its target) needs from the foul line to z, seconds.
 * Speed linear in distance gives dz/dt = a + b z, so t = ln(v(z) / v0) / b up to the approach zone,
 * then constant speed. Used to place a returning ball where a clean run meets it.
 */
export function cleanRunTimeTo(z: number): number {
  const slope = (MAX_SPEED_MPS - START_SPEED_MPS) / MAX_SPEED_AT_Z_M;
  const ramp = Math.min(z, MAX_SPEED_AT_Z_M);
  const rampTime = Math.log(targetSpeed(ramp) / START_SPEED_MPS) / slope;
  return rampTime + Math.max(0, z - MAX_SPEED_AT_Z_M) / MAX_SPEED_MPS;
}
