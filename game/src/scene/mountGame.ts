import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import { createPlaceholder } from '@models';

/** Default framing of the workspace smoke scene: radius in metres, angles in radians. */
const SMOKE_CAMERA = { alpha: -Math.PI / 3, beta: Math.PI / 3, radiusM: 4 } as const;

/** Creates the active camera as soon as the scene exists, before its first frame. */
export function createGameCamera(scene: Scene): void {
  scene.activeCamera = new ArcRotateCamera(
    'smoke-camera',
    SMOKE_CAMERA.alpha,
    SMOKE_CAMERA.beta,
    SMOKE_CAMERA.radiusM,
    Vector3.Zero(),
    scene,
  );
}

/** Mounts the game into the Reactylon scene and returns its cleanup. */
export function mountGame(scene: Scene): () => void {
  const light = new HemisphericLight('smoke-light', Vector3.Up(), scene);
  const model = createPlaceholder(scene, {});
  return () => {
    model.dispose();
    light.dispose();
  };
}
