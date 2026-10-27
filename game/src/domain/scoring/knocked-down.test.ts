import { pinSpots } from '@models/measures/pins';
import { PROP_SCALE } from '@models/measures/scale';
import { describe, expect, it } from 'vitest';
import { isDown, pinsDown, type PinPose } from './knocked-down';

const HEAD = pinSpots()[0] ?? { pin: 1 as const, x: 0, z: 0 };
const upright: PinPose = { x: HEAD.x, z: HEAD.z, up: [0, 1, 0] };
const tilted = (deg: number): PinPose => ({ ...upright, up: [Math.sin((deg * Math.PI) / 180), Math.cos((deg * Math.PI) / 180), 0] });

describe('knocked-down rule', () => {
  it('an upright pin on its spot is standing', () => expect(isDown(1, upright)).toBe(false));
  it('a pin tilted 50° is down', () => expect(isDown(1, tilted(50))).toBe(true));
  it('a pin tilted 40° still stands', () => expect(isDown(1, tilted(40))).toBe(false));
  it('an upright pin moved 0.2 m × PROP_SCALE is down', () => expect(isDown(1, { ...upright, x: upright.x + 0.2 * PROP_SCALE })).toBe(true));
  it('counts every pin, and a missing pin as down', () => {
    const poses = new Map(pinSpots().map((s) => [s.pin, { x: s.x, z: s.z, up: [0, 1, 0] as const }]));
    expect(pinsDown(poses)).toEqual([]);
    poses.delete(7);
    expect(pinsDown(poses)).toEqual([7]);
  });
});
