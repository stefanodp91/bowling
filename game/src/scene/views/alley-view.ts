import type { Scene } from '@babylonjs/core/scene';
import { createAlleySegment, LANE_LENGTH_M, SEGMENT_LENGTH_M } from '@models';
import { firstVisibleSegment, SEGMENT_POOL_SIZE } from './segment-window';

/** The room runs one segment past the head pin; the masking wall hides what lies beyond it. */
const LAST_SEGMENT = LANE_LENGTH_M / SEGMENT_LENGTH_M;

/**
 * The alley around the lane (wiki/models/lane.md, rule 6), drawn as recycled 20 m segments that
 * follow the lane's own window around the camera.
 */
export function createAlleyView(scene: Scene): { update(cameraZ: number): void; dispose(): void } {
  const segment = createAlleySegment(scene, {});
  segment.root.setEnabled(false);
  const pool = Array.from({ length: SEGMENT_POOL_SIZE }, (_, i) => segment.instantiate(`alley-segment-${i}`));
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
      for (const instance of pool) instance.dispose();
    },
  };
}
