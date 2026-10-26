import { laneCentreX, type LaneIndex } from '@models/measures/lane';
import { describe, expect, it } from 'vitest';
import { ACCEL_MPS2, JUMP_APEX_M, MAX_SPEED_MPS, SIM_STEP_S } from '../../config/run';
import { runStateAt } from '../run/step';
import type { RunState } from '../run/state';
import { initialWorld, worldStep, type World } from '../simulation';
import type { Obstacle, Track } from '../track/schema';
import { aimErrorOf, applyImpacts, initialImpacts } from './impacts';

const trackWith = (...obstacles: Obstacle[]): Track => ({ schemaVersion: 1, trackId: 't', seed: 7, lengthM: 500, lanes: 3, obstacles });
const ballAt = (z: number, lane: LaneIndex, y = 0, runS = 0): RunState => ({ ...runStateAt(z), lane, x: laneCentreX(lane), y, runS });
const hits = (track: Track, ball: RunState) => applyImpacts(ball, initialImpacts(track), track).impacts.count;

const LANE_KINDS: Obstacle[] = [
  { kind: 'stray-pins', lane: 1, z: 100 },
  { kind: 'rental-shoes', lane: 1, z: 100 },
  { kind: 'returning-ball', lane: 1, z: 100, speedMps: 3 },
  { kind: 'widening-gutter', lane: 1, z: 100, lengthM: 12 },
];

describe('impacts, one obstacle kind at a time', () => {
  it.each(LANE_KINDS.map((o) => [o.kind, o] as const))('%s: in its lane at its z → one impact; another lane → none', (_, obstacle) => {
    const track = trackWith(obstacle);
    const z = obstacle.kind === 'widening-gutter' ? obstacle.z + 1 : obstacle.z;
    expect(hits(track, ballAt(z, 1))).toBe(1);
    expect(hits(track, ballAt(z, 0))).toBe(0);
  });

  it('sweep bar: blocks every lane on the ground, none at jump apex', () => {
    const track = trackWith({ kind: 'sweep-bar', z: 100 });
    for (const lane of [0, 1, 2] as const) expect(hits(track, ballAt(100, lane))).toBe(1);
    expect(hits(track, ballAt(100, 1, JUMP_APEX_M))).toBe(0);
  });

  it('stray pins and a returning ball are hit even at jump apex: they are not jumpable', () => {
    expect(hits(trackWith({ kind: 'stray-pins', lane: 1, z: 100 }), ballAt(100, 1, JUMP_APEX_M))).toBe(1);
    expect(hits(trackWith({ kind: 'returning-ball', lane: 1, z: 100, speedMps: 3 }), ballAt(100, 1, JUMP_APEX_M))).toBe(1);
  });

  it('rental shoes: none at jump apex', () => {
    expect(hits(trackWith({ kind: 'rental-shoes', lane: 1, z: 100 }), ballAt(100, 1, JUMP_APEX_M))).toBe(0);
  });

  it('a returning ball is hit where it is at that time, not where it started', () => {
    const track = trackWith({ kind: 'returning-ball', lane: 1, z: 100, speedMps: 3 });
    expect(hits(track, ballAt(70, 1, 0, 10))).toBe(1);
    expect(hits(track, ballAt(100, 1, 0, 10))).toBe(0);
  });

  it('each obstacle is hit once', () => {
    const track = trackWith({ kind: 'stray-pins', lane: 1, z: 100 });
    const first = applyImpacts(ballAt(100, 1), initialImpacts(track), track);
    expect(applyImpacts(first.run, first.impacts, track).impacts.count).toBe(1);
  });

  it('a widening gutter pushes the ball to an adjacent lane', () => {
    const track = trackWith({ kind: 'widening-gutter', lane: 2, z: 100, lengthM: 12 });
    const after = applyImpacts(ballAt(101, 2), initialImpacts(track), track).run;
    expect(after.laneChange?.to).toBe(1);
  });
});

describe('impact cost', () => {
  it('drops 12 m/s to 9 m/s and recovers to the target at 1.5 m/s²', () => {
    const track = trackWith({ kind: 'stray-pins', lane: 1, z: 470 });
    let world: World = { ...initialWorld(track, 469.9), run: { ...runStateAt(469.9), speedMps: MAX_SPEED_MPS } };
    let speedAfter = 0;
    for (let i = 0; i < 10 && speedAfter === 0; i += 1) {
      const result = worldStep(world, track, 'stay', SIM_STEP_S);
      world = result.world;
      if (result.events.length > 0) speedAfter = world.run.speedMps;
    }
    expect(speedAfter).toBeCloseTo(9, 1);
    const recoverySteps = Math.round((MAX_SPEED_MPS - speedAfter) / ACCEL_MPS2 / SIM_STEP_S);
    for (let i = 0; i < recoverySteps; i += 1) world = worldStep(world, track, 'stay', SIM_STEP_S).world;
    expect(world.run.speedMps).toBeCloseTo(MAX_SPEED_MPS, 1);
  });

  it('gives the same aim error for the same track, seed and commands', () => {
    expect(aimErrorOf(7, 3)).toBe(aimErrorOf(7, 3));
    expect(aimErrorOf(7, 3)).not.toBe(aimErrorOf(7, 4));
    const track = trackWith({ kind: 'stray-pins', lane: 1, z: 60 }, { kind: 'rental-shoes', lane: 1, z: 85 });
    const runOnce = () => {
      let world = initialWorld(track, 40);
      for (let i = 0; i < 1200; i += 1) world = worldStep(world, track, 'stay', SIM_STEP_S).world;
      return world.impacts;
    };
    expect(runOnce()).toEqual(runOnce());
    expect(runOnce().count).toBe(2);
  });
});
