import type { Scene } from '@babylonjs/core/scene';
import {
  BALL_RETURN_HOOD_START_Z_M,
  BALL_RETURN_X_M,
  createAlleyEndWall,
  createAlleySegment,
  createBallReturn,
  LANE_LENGTH_M,
  MASKING_WALL_Z_M,
  SEGMENT_LENGTH_M,
  type Scenery,
} from '@models';
import { firstVisibleSegment, SEGMENT_POOL_SIZE } from './segment-window';

/** The room runs one segment past the head pin; the masking wall hides what lies beyond it. */
const LAST_SEGMENT = LANE_LENGTH_M / SEGMENT_LENGTH_M;
/** The room's end wall stands just in front of the deck's own dark wall, so the two never fight. */
const END_WALL_AHEAD_M = 0.02;

/**
 * The alley around the lane (wiki/models/lane.md, rule 6), in the track's theme: recycled 20 m
 * segments that follow the lane's own window around the camera, the end wall over the pins, and
 * the ball return at the start.
 */
export function createAlleyView(scene: Scene, scenery: Scenery): { update(cameraZ: number): void; dispose(): void } {
  const segment = createAlleySegment(scene, { scenery });
  segment.root.setEnabled(false);
  const pool = Array.from({ length: SEGMENT_POOL_SIZE }, (_, i) => segment.instantiate(`alley-segment-${i}`));
  const endWall = createAlleyEndWall(scene, { scenery });
  endWall.root.position.z = LANE_LENGTH_M + MASKING_WALL_Z_M - END_WALL_AHEAD_M;
  const ballReturn = createBallReturn(scene, { scenery });
  ballReturn.root.position.set(BALL_RETURN_X_M, 0, BALL_RETURN_HOOD_START_Z_M);
  const update = (cameraZ: number): void => {
    const first = firstVisibleSegment(cameraZ);
    pool.forEach((instance, i) => {
      const index = first + i;
      instance.setEnabled(index <= LAST_SEGMENT);
      instance.position.z = index * SEGMENT_LENGTH_M;
    });
  };
  return {
    update,
    dispose: () => {
      segment.dispose();
      endWall.dispose();
      ballReturn.dispose();
      for (const instance of pool) instance.dispose();
    },
  };
}
