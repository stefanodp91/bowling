import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import { applyAlleyEnvironment, createStageFloor, type ModelFactory } from '@models';
import {
  AMBIENT_LIGHT_INTENSITY,
  FLOOR_MIN_SIZE_M,
  FLOOR_SIZE_FACTOR,
  KEY_LIGHT,
  READY_AFTER_FRAMES,
  STAGE_BACKGROUND_HEX,
  STAGE_FOV_RAD,
  STAGE_NEAR_M,
  STAGE_POSES,
  type StageAngle,
} from './stage-config';

export interface StageRequest<Options> {
  readonly factory: ModelFactory<Options>;
  readonly options: Options;
  readonly angle: StageAngle;
  readonly onReady: () => void;
}

/** Creates the stage camera; the mount then frames it on the model. */
export function createStageCamera(scene: Scene): void {
  const camera = new ArcRotateCamera('stage-camera', 0, 0, 1, Vector3.Zero(), scene);
  camera.fov = STAGE_FOV_RAD;
  camera.minZ = STAGE_NEAR_M;
  scene.activeCamera = camera;
}

/** Mounts one model on the stage: environment, lights, floor, framing; returns the cleanup. */
export function mountStage<Options>(scene: Scene, request: StageRequest<Options>): () => void {
  scene.clearColor = Color4.FromHexString(`${STAGE_BACKGROUND_HEX}FF`);
  const environment = applyAlleyEnvironment(scene);
  const ambient = new HemisphericLight('stage-ambient', Vector3.Up(), scene);
  ambient.intensity = AMBIENT_LIGHT_INTENSITY;
  const key = new DirectionalLight('stage-key', new Vector3(...KEY_LIGHT.direction), scene);
  key.intensity = KEY_LIGHT.intensity;

  const model = request.factory(scene, request.options);
  const { min, max } = model.root.getHierarchyBoundingVectors();
  const centre = min.add(max).scale(0.5);
  const radius = max.subtract(min).length() / 2;
  const extent = Math.max(max.x - min.x, max.z - min.z);
  const floor = createStageFloor(scene, { sizeM: Math.max(FLOOR_MIN_SIZE_M, extent * FLOOR_SIZE_FACTOR) });
  floor.root.position.set(centre.x, 0, centre.z);
  frameCamera(scene, centre, radius, request.angle);

  const startMs = performance.now();
  const animate = scene.onBeforeRenderObservable.add(() => model.animate?.((performance.now() - startMs) / 1000));
  let frames = 0;
  const readiness = scene.onAfterRenderObservable.add(() => {
    if (!scene.isReady()) return;
    frames += 1;
    if (frames === READY_AFTER_FRAMES) request.onReady();
  });

  return () => {
    readiness.remove();
    animate.remove();
    floor.dispose();
    model.dispose();
    key.dispose();
    ambient.dispose();
    environment.dispose();
  };
}

function frameCamera(scene: Scene, centre: Vector3, radius: number, angle: StageAngle): void {
  const camera = scene.activeCamera;
  if (!(camera instanceof ArcRotateCamera)) throw new Error('stage camera missing: createStageCamera runs on scene ready');
  const pose = STAGE_POSES[angle];
  camera.setTarget(centre);
  camera.alpha = pose.alpha;
  camera.beta = pose.beta;
  camera.radius = (radius / Math.sin(STAGE_FOV_RAD / 2)) * pose.distanceFactor;
}
