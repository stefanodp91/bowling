import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { describe, expect, it } from 'vitest';
import { TRAVEL_LANE_WIDTH_M } from '../../measures/lane';
import { WET_FLOOR_SIGN_FOOTPRINT } from '../../measures/obstacles';
import { createWetFloorSign } from './wet-floor-sign';

/** Tolerance for the panels' thickness at the feet, which the footprint does not count. */
const THICKNESS_TOLERANCE_M = 0.03;

describe('wet floor sign', () => {
  it('fits inside its footprint, and the footprint inside one travel lane', () => {
    const { min, max } = createWetFloorSign(new Scene(new NullEngine()), {}).root.getHierarchyBoundingVectors();
    expect(max.x).toBeLessThanOrEqual(WET_FLOOR_SIGN_FOOTPRINT.halfWidthM + 1e-6);
    expect(min.x).toBeGreaterThanOrEqual(-WET_FLOOR_SIGN_FOOTPRINT.halfWidthM - 1e-6);
    expect(max.z).toBeLessThanOrEqual(WET_FLOOR_SIGN_FOOTPRINT.halfDepthM + THICKNESS_TOLERANCE_M);
    expect(min.z).toBeGreaterThanOrEqual(-WET_FLOOR_SIGN_FOOTPRINT.halfDepthM - THICKNESS_TOLERANCE_M);
    expect(max.y).toBeCloseTo(WET_FLOOR_SIGN_FOOTPRINT.heightM, 1);
    expect(2 * WET_FLOOR_SIGN_FOOTPRINT.halfWidthM).toBeLessThanOrEqual(TRAVEL_LANE_WIDTH_M);
  });
});
