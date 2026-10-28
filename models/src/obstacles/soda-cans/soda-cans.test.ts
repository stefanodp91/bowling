import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { describe, expect, it } from 'vitest';
import { PLAYING_SURFACE_WIDTH_M } from '../../measures/lane';
import { SODA_CAN_DIAMETER_M, SODA_CAN_HEIGHT_M, SODA_CANS_FOOTPRINT } from '../../measures/obstacles';
import { createSodaCans, sodaCanPlacements } from './soda-cans';

/** A lying can's band stands proud of the body by 1 % of the radius, under a millimetre into the lane. */
const BAND_TOLERANCE_M = 0.001;
/** How far a can reaches from its centre along z, lying (half its length) or standing (its radius). */
const reachZ = (lying: boolean): number => (lying ? SODA_CAN_HEIGHT_M / 2 : SODA_CAN_DIAMETER_M / 2);

describe('soda cans', () => {
  it.each([1, 2, 3, 42, 1001])('keep every can inside the footprint along z (seed %i)', (seed) => {
    for (const { z, lying } of sodaCanPlacements(seed)) expect(Math.abs(z) + reachZ(lying)).toBeLessThanOrEqual(SODA_CANS_FOOTPRINT.halfDepthM + 1e-9);
  });

  it('span the whole playing surface, with gaps narrower than a can', () => {
    expect(2 * SODA_CANS_FOOTPRINT.halfWidthM).toBeCloseTo(PLAYING_SURFACE_WIDTH_M, 9);
    const xs = sodaCanPlacements(1).map((p) => p.x).sort((a, b) => a - b);
    expect(xs[0] ?? 0).toBeLessThan(-PLAYING_SURFACE_WIDTH_M / 2 + SODA_CAN_DIAMETER_M * 2);
  });

  it('place the same row for the same seed and a different one for another seed', () => {
    expect(sodaCanPlacements(5)).toEqual(sodaCanPlacements(5));
    expect(sodaCanPlacements(5)).not.toEqual(sodaCanPlacements(6));
  });

  it('stand no taller than a can, on the lane', () => {
    const scene = new Scene(new NullEngine());
    const { min, max } = createSodaCans(scene, { seed: 1 }).root.getHierarchyBoundingVectors();
    expect(min.y).toBeGreaterThanOrEqual(-BAND_TOLERANCE_M);
    expect(max.y).toBeLessThanOrEqual(SODA_CANS_FOOTPRINT.heightM + 1e-6);
  });
});
