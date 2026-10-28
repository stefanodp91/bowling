import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { createLaneSegment, createWideningGutter, SEGMENT_LENGTH_M, type ModelHandle, type WideningGutterOptions } from '@models';

/** Lane segments under the gutter in the story, enough to hold 18 m plus the ramps. */
const SEGMENTS = 2;
/** Where the full-depth channel starts in the story, metres from the first segment's start. */
const GUTTER_START_Z_M = 6;

/**
 * The widening gutter as the game shows it: cut into the lane segments it replaces. Composes model
 * factories only — no geometry here.
 */
export function createWideningGutterScene(scene: Scene, options: WideningGutterOptions): ModelHandle {
  const root = new TransformNode('widening-gutter-scene', scene);
  const parts: ModelHandle[] = Array.from({ length: SEGMENTS }, (_, i) => {
    const segment = createLaneSegment(scene, {});
    segment.root.position.z = i * SEGMENT_LENGTH_M;
    return segment;
  });
  const gutter = createWideningGutter(scene, options);
  gutter.root.position.z = GUTTER_START_Z_M;
  parts.push(gutter);
  for (const part of parts) part.root.parent = root;
  return { root, dispose: () => parts.forEach((part) => part.dispose()) };
}
