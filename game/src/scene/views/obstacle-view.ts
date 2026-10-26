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
import { obstacleZAt, placedBox } from '../../domain/impacts/footprints';
import { extentOf } from '../../domain/track/extent';
import type { Obstacle, Track } from '../../domain/track/schema';
import { knockAway, type Knocked } from './knock-away';

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

export interface ObstacleView {
  update(cameraZ: number, runS: number): void;
  /** An impact: the obstacle flies off (terrain stays). */
  knock(index: number, runS: number, ballSpeedMps: number): void;
  /** Ages knocked obstacles by one simulation step and removes the expired ones. */
  age(dtS: number): void;
  dispose(): void;
}

/**
 * The track's obstacles near the camera, created when they come within the fog and disposed once
 * behind it: a 500 m track never holds more than a handful of models.
 */
export function createObstacleView(scene: Scene, track: Track): ObstacleView {
  const live = new Map<number, ModelHandle>();
  const knocked = new Map<number, Knocked>();
  /** Obstacles that were knocked away and removed: never drawn again in this run. */
  const gone = new Set<number>();
  const update = (cameraZ: number, runS: number): void => {
    track.obstacles.forEach((obstacle, index) => {
      if (knocked.has(index) || gone.has(index)) return;
      const z = obstacleZAt(obstacle, runS);
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
    knock: (index, runS, ballSpeedMps) => {
      const obstacle = track.obstacles[index];
      const model = live.get(index);
      if (obstacle === undefined || model === undefined || obstacle.kind === 'widening-gutter') return;
      live.delete(index);
      knocked.set(index, knockAway(scene, model, placedBox(obstacle, runS), ballSpeedMps));
    },
    age: (dtS) => {
      for (const [index, item] of knocked) {
        const remainingS = item.remainingS - dtS;
        if (remainingS > 0) {
          knocked.set(index, { remainingS, dispose: item.dispose });
        } else {
          item.dispose();
          knocked.delete(index);
          gone.add(index);
        }
      }
    },
    dispose: () => {
      for (const model of live.values()) model.dispose();
      for (const item of knocked.values()) item.dispose();
      live.clear();
      knocked.clear();
    },
  };
}
