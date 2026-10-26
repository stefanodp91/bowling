import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { describe, expect, it } from 'vitest';
import { PIN_HEIGHT_M, PIN_MAX_DIAMETER_M, PIN_SPACING_M, pinSpots } from '../measures/pins';
import { createPin } from './pin';

const MM = 0.001;

describe('pin model', () => {
  it('is 15 in tall and 4.766 in at the belly (±2 mm)', () => {
    const scene = new Scene(new NullEngine());
    const { min, max } = createPin(scene, {}).root.getHierarchyBoundingVectors();
    expect(Math.abs(max.y - min.y - PIN_HEIGHT_M)).toBeLessThanOrEqual(2 * MM);
    expect(Math.abs(max.x - min.x - PIN_MAX_DIAMETER_M)).toBeLessThanOrEqual(2 * MM);
    expect(Math.abs(PIN_MAX_DIAMETER_M - 0.121)).toBeLessThanOrEqual(2 * MM);
  });
});

describe('pin layout', () => {
  const spots = pinSpots();

  it('has ten spots, pin 1 the nearest to the foul line', () => {
    expect(spots).toHaveLength(10);
    const nearest = [...spots].sort((a, b) => a.z - b.z)[0];
    expect(nearest?.pin).toBe(1);
  });

  it('puts neighbouring spots 12 in apart (±1 mm)', () => {
    let neighbours = 0;
    for (const a of spots) {
      for (const b of spots) {
        const d = Math.hypot(a.x - b.x, a.z - b.z);
        if (a.pin < b.pin && d < PIN_SPACING_M * 1.1) {
          neighbours += 1;
          expect(Math.abs(d - 0.3048)).toBeLessThanOrEqual(MM);
        }
      }
    }
    expect(neighbours).toBe(18);
  });

  it('numbers each row left to right as seen from the foul line', () => {
    const x = (pin: number) => spots.find((s) => s.pin === pin)?.x ?? NaN;
    expect(x(7)).toBeLessThan(x(8));
    expect(x(8)).toBeLessThan(x(9));
    expect(x(9)).toBeLessThan(x(10));
    expect(x(2)).toBeLessThan(x(3));
  });
});
