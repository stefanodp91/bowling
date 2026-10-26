import { laneCentreX } from '@models/measures/lane';
import {
  RENTAL_SHOES_FOOTPRINT,
  RETURNING_BALL_FOOTPRINT,
  STRAY_PINS_FOOTPRINT,
  SWEEP_BAR_FOOTPRINT,
  wideningGutterFootprint,
  type Footprint,
} from '@models/measures/obstacles';
import { JUMPABLE_KINDS } from '../../config/impacts';
import type { Obstacle } from '../track/schema';

/** An obstacle's footprint placed on the lane at run time `runS`: a box in x, z and height. */
export interface PlacedBox {
  readonly x: number;
  readonly z: number;
  readonly halfWidthM: number;
  readonly halfDepthM: number;
  readonly heightM: number;
  /** Whether an airborne ball can pass over it at all. */
  readonly jumpable: boolean;
}

function footprintOf(obstacle: Obstacle): Footprint {
  switch (obstacle.kind) {
    case 'stray-pins':
      return STRAY_PINS_FOOTPRINT;
    case 'rental-shoes':
      return RENTAL_SHOES_FOOTPRINT;
    case 'returning-ball':
      return RETURNING_BALL_FOOTPRINT;
    case 'sweep-bar':
      return SWEEP_BAR_FOOTPRINT;
    case 'widening-gutter':
      return wideningGutterFootprint(obstacle.lengthM);
  }
}

/** Where an obstacle is at run time `runS`: a returning ball rolls towards the foul line (rule 1). */
export function obstacleZAt(obstacle: Obstacle, runS: number): number {
  return obstacle.kind === 'returning-ball' ? obstacle.z - obstacle.speedMps * runS : obstacle.z;
}

export function placedBox(obstacle: Obstacle, runS: number): PlacedBox {
  const footprint = footprintOf(obstacle);
  return {
    x: obstacle.kind === 'sweep-bar' ? 0 : laneCentreX(obstacle.lane),
    z: obstacleZAt(obstacle, runS) + footprint.centreZM,
    halfWidthM: footprint.halfWidthM,
    halfDepthM: footprint.halfDepthM,
    heightM: footprint.heightM,
    jumpable: JUMPABLE_KINDS.has(obstacle.kind),
  };
}
