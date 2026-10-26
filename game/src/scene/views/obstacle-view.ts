import type { Scene } from '@babylonjs/core/scene';
import {
  createRentalShoes,
  createReturningBall,
  createStrayPins,
  createSweepBar,
  createWideningGutter,
  laneCentreX,
  type ModelHandle,
} from '@models';
import { FOG_END_M } from '../../config/camera';
import { OBSTACLES_BEHIND_M, SWEEP_SWING_PERIOD_S } from '../../config/scene';
import { extentOf } from '../../domain/track/extent';
import type { Obstacle, Track } from '../../domain/track/schema';

/** The model of one obstacle, placed where the track says (the factory call the catalogue uses). */
function createObstacleModel(scene: Scene, obstacle: Obstacle, trackSeed: number, index: number): ModelHandle {
  switch (obstacle.kind) {
    case 'stray-pins':
      return createStrayPins(scene, { seed: trackSeed + index });
    case 'rental-shoes':
      return createRentalShoes(scene, {});
    case 'returning-ball':
      return createReturningBall(scene, { speedMps: obstacle.speedMps });
    case 'sweep-bar':
      return createSweepBar(scene, { swingPeriodS: SWEEP_SWING_PERIOD_S });
    case 'widening-gutter':
      return createWideningGutter(scene, { lengthM: obstacle.lengthM, lane: obstacle.lane });
  }
}

/** Where an obstacle is at run time `runS`: a returning ball rolls towards the foul line. */
export function obstacleZ(obstacle: Obstacle, runS: number): number {
  return obstacle.kind === 'returning-ball' ? obstacle.z - obstacle.speedMps * runS : obstacle.z;
}

/**
 * The track's obstacles near the camera, created when they come within the fog and disposed once
 * behind it: a 500 m track never holds more than a handful of models.
 */
export function createObstacleView(scene: Scene, track: Track): { update(cameraZ: number, runS: number): void; dispose(): void } {
  const live = new Map<number, ModelHandle>();
  const update = (cameraZ: number, runS: number): void => {
    track.obstacles.forEach((obstacle, index) => {
      const z = obstacleZ(obstacle, runS);
      const end = z + (extentOf(obstacle).endZ - extentOf(obstacle).startZ);
      const visible = end >= cameraZ - OBSTACLES_BEHIND_M && z <= cameraZ + FOG_END_M;
      let model = live.get(index);
      if (visible && model === undefined) {
        model = createObstacleModel(scene, obstacle, track.seed, index);
        live.set(index, model);
      } else if (!visible && model !== undefined) {
        model.dispose();
        live.delete(index);
        return;
      }
      if (model === undefined) return;
      if (obstacle.kind !== 'sweep-bar' && obstacle.kind !== 'widening-gutter') model.root.position.x = laneCentreX(obstacle.lane);
      model.root.position.z = z;
      model.animate?.(runS);
    });
  };
  return {
    update,
    dispose: () => {
      for (const model of live.values()) model.dispose();
      live.clear();
    },
  };
}
