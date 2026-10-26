import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { createLaneSegment, createPinDeck, FINAL_FOUL_LINE_Z_M, LANE_LENGTH_M, SEGMENT_LENGTH_M, type ModelFactory, type ModelHandle } from '@models';

export type PinDeckSceneOptions = Readonly<Record<string, never>>;

/**
 * The end of the lane as the game places it: the last segment, with its repeated markings, and the
 * pin deck. Composes model factories only — no geometry here. Root at the head pin spot.
 */
export const createPinDeckScene: ModelFactory<PinDeckSceneOptions> = (scene: Scene): ModelHandle => {
  const root = new TransformNode('pin-deck-scene', scene);
  const lastSegmentStart = LANE_LENGTH_M - SEGMENT_LENGTH_M;
  const segment = createLaneSegment(scene, { foulLineZ: FINAL_FOUL_LINE_Z_M - lastSegmentStart });
  segment.root.position.z = -SEGMENT_LENGTH_M;
  const deck = createPinDeck(scene, {});
  const parts: ModelHandle[] = [segment, deck];
  for (const part of parts) part.root.parent = root;
  return { root, dispose: () => parts.forEach((part) => part.dispose()) };
};
