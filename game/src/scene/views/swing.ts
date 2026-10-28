import { ADDRESS_ANGLE_RAD, ADDRESS_S, ARM_LENGTH_M, BACKSWING_ANGLE_RAD, BACKSWING_S, FORWARD_SWING_S } from '../../config/throw';
import { smoothstep } from '../../domain/math/ease';

/** How far the swing moves the ball from its spot on the foul line: up, and back towards the camera. */
export interface SwingOffset {
  readonly liftM: number;
  readonly backM: number;
}

/** The forward swing eases in as u³ (config/throw.ts derives the backswing from it). */
const FORWARD_EASE_POWER = 3;

/** The arm's angle from straight down `readyS` seconds into the countdown; positive is behind. */
export function swingAngle(readyS: number): number {
  if (readyS <= ADDRESS_S) return ADDRESS_ANGLE_RAD;
  const back = (readyS - ADDRESS_S) / BACKSWING_S;
  if (back <= 1) return ADDRESS_ANGLE_RAD + (BACKSWING_ANGLE_RAD - ADDRESS_ANGLE_RAD) * smoothstep(back);
  const forward = Math.min(1, (readyS - ADDRESS_S - BACKSWING_S) / FORWARD_SWING_S);
  return BACKSWING_ANGLE_RAD * (1 - forward ** FORWARD_EASE_POWER);
}

/**
 * Where the bowler's arm holds the ball during the countdown (wiki/game/run.md, rule 3): a pendulum
 * about the shoulder, whose lowest point puts the ball on the lane at the foul line. Pure: the same
 * moment, the same pose. At the end of the countdown the offset is zero and the run takes over.
 */
export function swingOffset(readyS: number): SwingOffset {
  const angle = swingAngle(readyS);
  return { liftM: ARM_LENGTH_M * (1 - Math.cos(angle)), backM: ARM_LENGTH_M * Math.sin(angle) };
}
