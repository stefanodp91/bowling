import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { createLaneSegment, createPin, createPinDeck, FINAL_FOUL_LINE_Z_M, LANE_LENGTH_M, pinSpots, SEGMENT_LENGTH_M, type ModelFactory, type ModelHandle } from '@models';

export type PinDeckSceneOptions = Readonly<Record<string, never>>;

/**
 * The end of the lane as the game places it: the last segment, with its repeated markings, the pin
 * deck and the ten pins on their spots. Composes model factories only — no geometry here. Root at
 * the head pin spot.
 */
export const createPinDeckScene: ModelFactory<PinDeckSceneOptions> = (scene: Scene): ModelHandle => {
  const root = new TransformNode('pin-deck-scene', scene);
  const lastSegmentStart = LANE_LENGTH_M - SEGMENT_LENGTH_M;
  const segment = createLaneSegment(scene, { foulLineZ: FINAL_FOUL_LINE_Z_M - lastSegmentStart });
  segment.root.position.z = -SEGMENT_LENGTH_M;
  const deck = createPinDeck(scene, {});
  const pin = createPin(scene, {});
  pin.root.setEnabled(false);
  for (const spot of pinSpots()) {
    const placed = pin.instantiate(`pin-${spot.pin}`);
    placed.position.set(spot.x, 0, spot.z);
    placed.parent = root;
  }
  const parts: ModelHandle[] = [segment, deck, pin];
  for (const part of parts) part.root.parent = root;
  return { root, dispose: () => parts.forEach((part) => part.dispose()) };
};
