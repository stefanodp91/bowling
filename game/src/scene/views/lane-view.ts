import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { createLaneSegment, createPinDeck, FINAL_FOUL_LINE_Z_M, LANE_LENGTH_M, SEGMENT_LENGTH_M } from '@models';
import { SEGMENTS_AHEAD, SEGMENTS_BEHIND } from '../../config/scene';

const LAST_SEGMENT = LANE_LENGTH_M / SEGMENT_LENGTH_M - 1;
const POOL_SIZE = SEGMENTS_BEHIND + SEGMENTS_AHEAD;

/**
 * The lane drawn as a few recycled 20 m segments around the camera (wiki/models/lane.md,
 * rule 4): the first and last segments carry their markings, the rest are instances of a plain one.
 */
export function createLaneView(scene: Scene): { update(cameraZ: number): void; dispose(): void } {
  const start = createLaneSegment(scene, { foulLineZ: 0 });
  const final = createLaneSegment(scene, { foulLineZ: FINAL_FOUL_LINE_Z_M - LAST_SEGMENT * SEGMENT_LENGTH_M });
  final.root.position.z = LAST_SEGMENT * SEGMENT_LENGTH_M;
  const plain = createLaneSegment(scene, {});
  plain.root.setEnabled(false);
  const pool: TransformNode[] = Array.from({ length: POOL_SIZE }, (_, i) => plain.instantiate(`lane-segment-${i}`));
  const deck = createPinDeck(scene, {});
  deck.root.position.z = LANE_LENGTH_M;

  const update = (cameraZ: number): void => {
    const first = Math.max(0, Math.floor(cameraZ / SEGMENT_LENGTH_M) - SEGMENTS_BEHIND);
    start.root.setEnabled(first === 0);
    final.root.setEnabled(first + POOL_SIZE > LAST_SEGMENT);
    pool.forEach((segment, i) => {
      const index = first + i;
      const isPlain = index > 0 && index < LAST_SEGMENT;
      segment.setEnabled(isPlain);
      segment.position.z = index * SEGMENT_LENGTH_M;
    });
  };
  return {
    update,
    dispose: () => {
      for (const handle of [start, final, plain, deck]) handle.dispose();
      for (const segment of pool) segment.dispose();
    },
  };
}
