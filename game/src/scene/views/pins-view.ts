import { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { createPin, LANE_LENGTH_M, pinSpots, type PinNumber } from '@models';

/** The ten pins on the deck, standing on their spots until physics moves them (wiki/game/pins.md). */
export interface PinsView {
  readonly pins: ReadonlyMap<PinNumber, TransformNode>;
  /** The source pin mesh (hidden): the physics collider is derived from it. */
  readonly pinMesh: Mesh;
  dispose(): void;
}

export function createPinsView(scene: Scene): PinsView {
  const pin = createPin(scene, {});
  pin.root.setEnabled(false);
  const pinMesh = pin.root.getChildMeshes(true)[0];
  if (!(pinMesh instanceof Mesh)) throw new Error('pin model has no mesh');
  const pins = new Map<PinNumber, TransformNode>();
  for (const spot of pinSpots()) {
    const placed = pin.instantiate(`deck-pin-${spot.pin}`);
    placed.position.set(spot.x, 0, LANE_LENGTH_M + spot.z);
    pins.set(spot.pin, placed);
  }
  return {
    pins,
    pinMesh,
    dispose: () => {
      for (const placed of pins.values()) placed.dispose();
      pin.dispose();
    },
  };
}
