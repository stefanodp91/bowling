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
 * diameter) overlaps the box in x and z, and its lowest point is not above the box's height. A
 * terrain obstacle (height 0) catches the ball only when it is on the lane.
 */
export function touches(ball: BallFootprint, box: PlacedBox): boolean {
  const overlapsX = Math.abs(ball.x - box.x) < box.halfWidthM + BALL_RADIUS_M;
  const overlapsZ = Math.abs(ball.z - box.z) < box.halfDepthM + BALL_RADIUS_M;
  const below = box.heightM > 0 ? ball.y < box.heightM : ball.y <= 0;
  return overlapsX && overlapsZ && below;
}
