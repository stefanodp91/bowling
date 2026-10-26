import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { createPin, LANE_LENGTH_M, pinSpots, type PinNumber } from '@models';

/** A pin's pose in the world: position of its base centre and rotation as a quaternion (x, y, z, w). */
export interface PinPose {
  readonly position: readonly [number, number, number];
  readonly rotation: readonly [number, number, number, number];
}

/** The ten pins on the deck, standing on their spots until physics moves them (wiki/game/pins.md). */
export function createPinsView(scene: Scene): { pins: ReadonlyMap<PinNumber, TransformNode>; dispose(): void } {
  const pin = createPin(scene, {});
  pin.root.setEnabled(false);
  const pins = new Map<PinNumber, TransformNode>();
  for (const spot of pinSpots()) {
    const placed = pin.instantiate(`deck-pin-${spot.pin}`);
    placed.position.set(spot.x, 0, LANE_LENGTH_M + spot.z);
    pins.set(spot.pin, placed);
  }
  return {
    pins,
    dispose: () => {
      for (const placed of pins.values()) placed.dispose();
      pin.dispose();
    },
  };
}
