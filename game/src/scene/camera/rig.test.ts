import { LANE_LENGTH_M, laneCentreX } from '@models/measures/lane';
import { describe, expect, it } from 'vitest';
import { CHASE_BEHIND_M, CHASE_HEIGHT_M, IMPACT_CAMERA_Z, SLOWMO_S, SLOWMO_SCALE } from '../../config/camera';
import { LANE_CHANGE_S } from '../../config/run';
import { cameraPose, impactPose, timeScaleAt, type RigInput } from './rig';

const at = (z: number, extra: Partial<RigInput> = {}): RigInput => ({ x: 0, y: 0, z, lastLaneChange: null, ...extra });

describe('camera rig', () => {
  it.each([0, 250, LANE_LENGTH_M - 5])('is a pure function of the run at z = %i: same input, same pose', (z) => {
    const input = at(z, { y: 0.2, lastLaneChange: { from: 1, to: 0, elapsedS: 0.1 } });
    expect(cameraPose(input)).toEqual(cameraPose({ ...input }));
  });

  it('chases 3 m behind and 1.2 m above the ball', () => {
    expect(cameraPose(at(250)).position).toEqual([0, CHASE_HEIGHT_M, 250 - CHASE_BEHIND_M]);
  });

  it('follows a lane change with a delay, and arrives', () => {
    const during = cameraPose(at(250, { x: laneCentreX(0), lastLaneChange: { from: 1, to: 0, elapsedS: LANE_CHANGE_S } })).position[0];
    expect(during).toBeGreaterThan(laneCentreX(0));
    const after = cameraPose(at(250, { x: laneCentreX(0), lastLaneChange: { from: 1, to: 0, elapsedS: 10 } })).position[0];
    expect(after).toBeCloseTo(laneCentreX(0));
  });

  it('follows only part of a jump', () => {
    const jumping = cameraPose(at(250, { y: 0.5 })).position[1];
    expect(jumping - CHASE_HEIGHT_M).toBeGreaterThan(0);
    expect(jumping - CHASE_HEIGHT_M).toBeLessThan(0.5);
  });

  it('is the impact side view from the impact zone on, chase before it', () => {
    expect(cameraPose(at(IMPACT_CAMERA_Z - 1)).position[2]).toBeLessThan(IMPACT_CAMERA_Z);
    expect(cameraPose(at(LANE_LENGTH_M - 2))).toEqual(impactPose());
    expect(impactPose().position[0]).toBeGreaterThan(1);
    expect(impactPose().target[2]).toBeGreaterThan(LANE_LENGTH_M);
  });
});

describe('slow motion', () => {
  it('halves time for SLOWMO_S after the first contact, never before or after', () => {
    expect(timeScaleAt(null)).toBe(1);
    expect(timeScaleAt(0)).toBe(SLOWMO_SCALE);
    expect(timeScaleAt(SLOWMO_S - 0.01)).toBe(SLOWMO_SCALE);
    expect(timeScaleAt(SLOWMO_S)).toBe(1);
  });
});
