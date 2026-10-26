import { describe, expect, it } from 'vitest';
import { TRAVEL_LANE_WIDTH_M } from '../../measures/lane';
import { STRAY_PINS_FOOTPRINT } from '../../measures/obstacles';
import { PIN_PROFILE } from '../../measures/pins';
import { strayPinPlacements } from './stray-pins';

const BASE_RADIUS_M = PIN_PROFILE[0]?.[1] ?? 0;

describe('stray pins footprint', () => {
  it.each([1, 2, 3, 42, 1001])('contains every pin base circle (seed %i)', (seed) => {
    for (const { x, z } of strayPinPlacements(seed)) {
      expect(Math.abs(x) + BASE_RADIUS_M).toBeLessThanOrEqual(STRAY_PINS_FOOTPRINT.halfWidthM);
      expect(Math.abs(z) + BASE_RADIUS_M).toBeLessThanOrEqual(STRAY_PINS_FOOTPRINT.halfDepthM);
    }
  });

  it('fits inside one travel lane', () => {
    expect(2 * STRAY_PINS_FOOTPRINT.halfWidthM).toBeLessThanOrEqual(TRAVEL_LANE_WIDTH_M);
  });

  it('places the same group for the same seed and a different one for another seed', () => {
    expect(strayPinPlacements(5)).toEqual(strayPinPlacements(5));
    expect(strayPinPlacements(5)).not.toEqual(strayPinPlacements(6));
  });
});
