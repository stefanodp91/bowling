import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Scene } from '@babylonjs/core/scene';
import { applyAlleyEnvironment } from '@models';
import type { Session } from '../app/session';
import { SIM_STEP_S } from '../config/run';
import { recordFrame } from '../dev/render-stats';
import { CHASE_FOV_RAD, FOG_END_M, FOG_HEX, FOG_START_M } from '../config/camera';
import { AMBIENT_INTENSITY, KEY_LIGHT } from '../config/scene';
import { cameraPose, timeScaleAt } from './camera/rig';
import { createDeck } from './physics/deck';
import { createBallView } from './views/ball-view';
import { createLaneView } from './views/lane-view';
import { createObstacleView } from './views/obstacle-view';
import { createPinsView } from './views/pins-view';
import type { HavokInstance } from './physics/havok-loader';
import { createPhysicsWorld } from './physics/physics-world';

const MS_PER_S = 1000;
/** Near plane: close enough for the ball 3 m away, far enough to keep depth precision over 140 m. */
const NEAR_M = 0.05;
/** A whole extra fog band of far plane, so the fog hides where the lane ends. */
const FAR_M = FOG_END_M * 2;

/** Creates the game camera as soon as the scene exists, before its first frame. */
export function createGameCamera(scene: Scene): void {
  const camera = new FreeCamera('game-camera', Vector3.Zero(), scene);
  camera.fov = CHASE_FOV_RAD;
  camera.minZ = NEAR_M;
  camera.maxZ = FAR_M;
  scene.activeCamera = camera;
}

export interface MountOptions {
  /** Freeze after the first rendered frame (the `pause` query parameter). */
  readonly pause: boolean;
  readonly havok: HavokInstance;
}

/** Mounts a session into the Reactylon scene: lights, lane, ball, obstacles, camera, the frame loop. */
export function mountGame(scene: Scene, session: Session, options: MountOptions): () => void {
  const fog = Color3.FromHexString(FOG_HEX);
  scene.clearColor = new Color4(fog.r, fog.g, fog.b, 1);
  scene.fogMode = Scene.FOGMODE_LINEAR;
  scene.fogColor = fog;
  scene.fogStart = FOG_START_M;
  scene.fogEnd = FOG_END_M;
  const environment = applyAlleyEnvironment(scene);
  const ambient = new HemisphericLight('game-ambient', Vector3.Up(), scene);
  ambient.intensity = AMBIENT_INTENSITY;
  const key = new DirectionalLight('game-key', new Vector3(...KEY_LIGHT.direction), scene);
  key.intensity = KEY_LIGHT.intensity;

  const physics = createPhysicsWorld(scene, options.havok);
  const lane = createLaneView(scene);
  const ball = createBallView(scene);
  const pins = createPinsView(scene);
  const deck = createDeck(scene, { ball: ball.root, pins: pins.pins, pinMesh: pins.pinMesh });
  const detach = session.attach({ physics, deck });
  const obstacles = createObstacleView(scene, session.track);
  const camera = scene.activeCamera;

  let frames = 0;
  const render = (frameS: number): void => {
    const timeScale = timeScaleAt(session.world().deck.sinceContactS);
    const { previous, current, alpha } = session.frame(frameS, timeScale, (_world, events) => {
      for (const event of events) obstacles.knock(event.obstacleIndex, event.runS, event.speedMps);
      obstacles.age(SIM_STEP_S);
    });
    const lerp = (a: number, b: number): number => a + (b - a) * alpha;
    const pose = { x: lerp(previous.x, current.x), y: lerp(previous.y, current.y), z: lerp(previous.z, current.z) };
    // From the hand-over on, Havok moves the ball.
    if (!session.world().deck.handedOff) ball.update(pose, lerp(previous.rollRad, current.rollRad));
    const { position, target } = cameraPose({ ...pose, lastLaneChange: current.lastLaneChange });
    if (camera instanceof FreeCamera) {
      camera.position.set(...position);
      camera.setTarget(new Vector3(...target));
    }
    lane.update(Math.min(position[2], pose.z));
    obstacles.update(Math.min(position[2], pose.z), lerp(previous.runS, current.runS));
  };
  render(0);
  const beforeRender = scene.onBeforeRenderObservable.add(() => {
    if (options.pause && frames > 0) return;
    render(scene.getEngine().getDeltaTime() / MS_PER_S);
  });
  const afterRender = scene.onAfterRenderObservable.add(() => {
    recordFrame(scene.getEngine().getDeltaTime(), scene.getActiveMeshes().length);
    if (!scene.isReady()) return;
    frames += 1;
    if (frames === 1) session.markReady();
  });

  return () => {
    beforeRender.remove();
    afterRender.remove();
    detach();
    deck.dispose();
    obstacles.dispose();
    pins.dispose();
    ball.dispose();
    lane.dispose();
    physics.dispose();
    key.dispose();
    ambient.dispose();
    environment.dispose();
  };
}
