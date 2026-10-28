import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
// Side effect: Scene.enablePhysics and the physics scene component live in this module.
import '@babylonjs/core/Physics/joinedPhysicsEngineComponent';
import type { Scene } from '@babylonjs/core/scene';
import {
  LANE_LENGTH_M,
  MASKING_WALL_HEIGHT_M,
  PIN_DECK_END_M,
  PIT_DEPTH_M,
  PIT_DROP_M,
  PLAYING_SURFACE_WIDTH_M,
} from '@models/measures/lane';
import { FLOOR_MARGIN_M, FLOOR_THICKNESS_M, GRAVITY_MPS2, LANE_SURFACE, PHYSICS_STEP_S, PHYSICS_SUBSTEPS } from '../../config/physics';
import { createBoxBody } from './box-body';
import type { PhysicsPort } from '../../app/deck-port';
import type { HavokInstance } from './havok-loader';

/**
 * Physics on a scene, stepped by the simulation, never by the frame (wiki/game/pins.md, rule 3):
 * each step() is PHYSICS_STEP_S in PHYSICS_SUBSTEPS substeps.
 */
export interface PhysicsWorld extends PhysicsPort {
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
  // The colliders follow what is drawn: the lane from behind the foul line to the deck's end, the
  // pit floor below it, the masking wall at its back. Off the sides there is nothing to land on.
  const laneEnd = LANE_LENGTH_M + PIN_DECK_END_M;
  const solids = [
    { name: 'physics-floor', size: [PLAYING_SURFACE_WIDTH_M, FLOOR_THICKNESS_M, laneEnd + FLOOR_MARGIN_M], position: [0, -FLOOR_THICKNESS_M / 2, (laneEnd - FLOOR_MARGIN_M) / 2] },
    { name: 'physics-pit', size: [PLAYING_SURFACE_WIDTH_M, FLOOR_THICKNESS_M, PIT_DEPTH_M], position: [0, -PIT_DROP_M - FLOOR_THICKNESS_M / 2, laneEnd + PIT_DEPTH_M / 2] },
    { name: 'physics-wall', size: [PLAYING_SURFACE_WIDTH_M, MASKING_WALL_HEIGHT_M, FLOOR_THICKNESS_M], position: [0, MASKING_WALL_HEIGHT_M / 2 - PIT_DROP_M, laneEnd + PIT_DEPTH_M + FLOOR_THICKNESS_M / 2] },
  ] as const;
  const bodies = solids.map((solid) => createBoxBody(scene, { ...solid, massKg: 0, surface: LANE_SURFACE }));
  return {
    step: () => {
      for (let i = 0; i < PHYSICS_SUBSTEPS; i += 1) {
        scene.onBeforePhysicsObservable.notifyObservers(scene);
        engine._step(PHYSICS_STEP_S / PHYSICS_SUBSTEPS);
        scene.onAfterPhysicsObservable.notifyObservers(scene);
      }
    },
    dispose: () => {
      for (const body of bodies) body.dispose();
      scene.disablePhysicsEngine();
    },
  };
}
