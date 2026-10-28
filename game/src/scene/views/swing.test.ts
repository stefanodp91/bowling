import { describe, expect, it } from 'vitest';
import { READY_S, RELEASE_SPEED_MPS } from '../../config/run';
import { ADDRESS_S, ARM_LENGTH_M, BACKSWING_ANGLE_RAD, BACKSWING_S } from '../../config/throw';
import { swingAngle, swingOffset } from './swing';

/** A short step for finite differences, seconds. */
const H = 1e-4;

describe('the bowler swing', () => {
  it('holds the ball in front, swings it back and high, and lays it on the foul line at the release', () => {
    expect(swingOffset(0).backM).toBeLessThan(0);
    const top = swingOffset(ADDRESS_S + BACKSWING_S);
    expect(swingAngle(ADDRESS_S + BACKSWING_S)).toBeCloseTo(BACKSWING_ANGLE_RAD, 9);
    expect(top.backM).toBeGreaterThan(ARM_LENGTH_M * 0.9);
    expect(top.liftM).toBeGreaterThan(ARM_LENGTH_M * 0.9);
    expect(swingOffset(READY_S)).toEqual({ liftM: 0, backM: 0 });
  });

  it('releases the ball as fast as the run rolls it', () => {
    const speed = ((swingAngle(READY_S - H) - swingAngle(READY_S)) * ARM_LENGTH_M) / H;
    expect(speed).toBeCloseTo(RELEASE_SPEED_MPS, 1);
  });

  it('is a pure function of the moment', () => {
    for (const t of [0, 0.4, 0.9, 1.2]) expect(swingOffset(t)).toEqual(swingOffset(t));
  });
});
