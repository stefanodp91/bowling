import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { describe, expect, it } from 'vitest';
import { TRAVEL_LANE_WIDTH_M } from '../../measures/lane';
import { GUTTER_RAMP_M } from '../../measures/obstacles';
import { createWideningGutter } from './widening-gutter';

describe('widening gutter', () => {
  it('spans exactly one travel lane width and lengthM plus the two ramps', () => {
    const scene = new Scene(new NullEngine());
    const handle = createWideningGutter(scene, { lengthM: 18, lane: 1 });
    const { min, max } = handle.root.getHierarchyBoundingVectors();
    expect(max.x - min.x).toBeCloseTo(TRAVEL_LANE_WIDTH_M, 6);
    expect(max.z - min.z).toBeCloseTo(18 + 2 * GUTTER_RAMP_M, 6);
    expect(max.y).toBeCloseTo(0, 6);
  });

  it('sits on the centre of the requested travel lane', () => {
    const scene = new Scene(new NullEngine());
    expect(createWideningGutter(scene, { lengthM: 10, lane: 0 }).root.position.x).toBeCloseTo(-TRAVEL_LANE_WIDTH_M, 6);
  });
});
