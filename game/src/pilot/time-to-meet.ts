import { BALL_RADIUS_M } from '@models/measures/ball';
import { placedBox } from '../domain/impacts/footprints';
import type { RunState } from '../domain/run/state';
import type { Obstacle } from '../domain/track/schema';

/**
 * Seconds until the ball reaches an obstacle (rule 3): distance over the ball's speed for a still
 * obstacle; over the sum of both speeds for a returning ball, which closes the gap from both sides.
 * Null once the obstacle is behind the ball.
 */
export function timeToMeet(obstacle: Obstacle, run: RunState): number | null {
  const box = placedBox(obstacle, run.runS);
  const front = box.z - box.halfDepthM - BALL_RADIUS_M;
  const back = box.z + box.halfDepthM + BALL_RADIUS_M;
  if (back < run.z) return null;
  const distance = Math.max(0, front - run.z);
  const closing = run.speedMps + (obstacle.kind === 'returning-ball' ? obstacle.speedMps : 0);
  return closing > 0 ? distance / closing : null;
}
