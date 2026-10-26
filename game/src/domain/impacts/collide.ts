import { BALL_RADIUS_M } from '@models/measures/ball';
import type { PlacedBox } from './footprints';

/** The ball as the collision test sees it: centre x and z, and its lowest point's height. */
export interface BallFootprint {
  readonly x: number;
  readonly z: number;
  readonly y: number;
}

/**
 * Whether the ball touches a placed footprint (rule 1): the ball's square footprint (side = its
 * diameter) overlaps the box in x and z, and — for a jumpable obstacle — its lowest point is not
 * above the box's height. A non-jumpable obstacle is hit at any height; terrain (height 0) only
 * catches a ball on the lane.
 */
export function touches(ball: BallFootprint, box: PlacedBox): boolean {
  const overlapsX = Math.abs(ball.x - box.x) < box.halfWidthM + BALL_RADIUS_M;
  const overlapsZ = Math.abs(ball.z - box.z) < box.halfDepthM + BALL_RADIUS_M;
  const below = box.heightM <= 0 ? ball.y <= 0 : !box.jumpable || ball.y < box.heightM;
  return overlapsX && overlapsZ && below;
}
