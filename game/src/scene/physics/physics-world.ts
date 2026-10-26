import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
// Side effect: Scene.enablePhysics and the physics scene component live in this module.
import '@babylonjs/core/Physics/joinedPhysicsEngineComponent';
import type { Scene } from '@babylonjs/core/scene';
import { LANE_LENGTH_M, PLAYING_SURFACE_WIDTH_M } from '@models/measures/lane';
import { FLOOR_MARGIN_M, FLOOR_THICKNESS_M, GRAVITY_MPS2, PHYSICS_STEP_S, PHYSICS_SUBSTEPS } from '../../config/physics';
import { createBoxBody } from './box-body';
import type { HavokInstance } from './havok-loader';

/** Physics on a scene, stepped by the simulation, never by the frame (wiki/game/pins.md, rule 3). */
export interface PhysicsWorld {
  /** Advances physics by one simulation step (PHYSICS_STEP_S, in PHYSICS_SUBSTEPS substeps). */
  step(): void;
  dispose(): void;
}

/**
 * Enables Havok through Babylon's plugin and turns off the scene's own per-frame stepping: the
 * simulation calls step() once per fixed step, so slow motion and speed-up never change physics.
 */
export function createPhysicsWorld(scene: Scene, havok: HavokInstance): PhysicsWorld {
  scene.enablePhysics(new Vector3(0, -GRAVITY_MPS2, 0), new HavokPlugin(false, havok));
  scene.physicsEnabled = false;
  const engine = scene.getPhysicsEngine();
  if (engine === null) throw new Error('Havok physics could not be enabled');
  engine.setTimeStep(PHYSICS_STEP_S / PHYSICS_SUBSTEPS);
  const floor = createBoxBody(scene, {
    name: 'physics-floor',
    size: [PLAYING_SURFACE_WIDTH_M + 2 * FLOOR_MARGIN_M, FLOOR_THICKNESS_M, LANE_LENGTH_M + 2 * FLOOR_MARGIN_M],
    position: [0, -FLOOR_THICKNESS_M / 2, LANE_LENGTH_M / 2],
    massKg: 0,
  });
  return {
    step: () => {
      for (let i = 0; i < PHYSICS_SUBSTEPS; i += 1) {
        scene.onBeforePhysicsObservable.notifyObservers(scene);
        engine._step(PHYSICS_STEP_S / PHYSICS_SUBSTEPS);
        scene.onAfterPhysicsObservable.notifyObservers(scene);
      }
    },
    dispose: () => {
      floor.dispose();
      scene.disablePhysicsEngine();
    },
  };
}
