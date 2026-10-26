import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { STRAY_PIN_JITTER_M, STRAY_PIN_POINTS } from '../../measures/obstacles';
import type { ModelFactory, ModelHandle } from '../../model-handle';
import { createPin } from '../../pins/pin';
import { seededRandom } from '../../procedural/seeded-random';

export interface StrayPinsOptions {
  /** Seed of the per-pin offsets and turns, so groups along the track do not look copied. */
  readonly seed: number;
}

/** Where each pin of a group stands, relative to the obstacle position, and how it is turned. */
export interface StrayPinPlacement {
  readonly x: number;
  readonly z: number;
  readonly yawRad: number;
}

/** The three placements of a group: the triangle points plus a seeded offset and turn. */
export function strayPinPlacements(seed: number): StrayPinPlacement[] {
  const random = seededRandom(seed);
  const jitter = (): number => (random() * 2 - 1) * STRAY_PIN_JITTER_M;
  return STRAY_PIN_POINTS.map(([x, z]) => ({ x: x + jitter(), z: z + jitter(), yawRad: random() * 2 * Math.PI }));
}

/**
 * Three regulation pins left standing in one travel lane (wiki/models/obstacles/stray-pins.md),
 * instanced from one pin. Root at the obstacle position on the lane surface.
 */
export const createStrayPins: ModelFactory<StrayPinsOptions> = (scene: Scene, { seed }): ModelHandle => {
  const root = new TransformNode('stray-pins', scene);
  const pin = createPin(scene, {});
  pin.root.setEnabled(false);
  pin.root.parent = root;
  strayPinPlacements(seed).forEach((placement, i) => {
    const placed = pin.instantiate(`stray-pin-${i}`);
    placed.position.set(placement.x, 0, placement.z);
    placed.rotation.y = placement.yawRad;
    placed.parent = root;
  });
  return { root, dispose: () => root.dispose(false, false) };
};
