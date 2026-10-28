import { laneCentreX, type LaneIndex, LANE_LENGTH_M } from '@models/measures/lane';
import { describe, expect, it } from 'vitest';
import { JUMP_APEX_M, RELEASE_SPEED_MPS, SIM_STEP_S } from '../../config/run';
import { ROLL_DRAG_PER_M, targetSpeed } from '../run/speed';
import { runStateAt } from '../run/step';
import type { RunState } from '../run/state';
import { initialWorld, worldStep, type World } from '../simulation';
import type { Obstacle, Track } from '../track/schema';
import { IMPACT_AIM_ERROR_M, IMPACT_AIM_ERROR_MIN_M } from '../../config/impacts';
import { aimErrorOf, applyImpacts, initialImpacts } from './impacts';

const trackWith = (...obstacles: Obstacle[]): Track => ({ schemaVersion: 1, trackId: 't', seed: 7, lengthM: LANE_LENGTH_M, lanes: 3, obstacles });
const ballAt = (z: number, lane: LaneIndex, y = 0, runS = 0): RunState => ({ ...runStateAt(z), lane, x: laneCentreX(lane), y, runS });
const hits = (track: Track, ball: RunState) => applyImpacts(ball, initialImpacts(track), track).impacts.count;

const LANE_KINDS: Obstacle[] = [
  { kind: 'wet-floor-sign', lane: 1, z: 100 },
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

  it('soda cans: block every lane on the ground, none at jump apex', () => {
    const track = trackWith({ kind: 'soda-cans', z: 100 });
    for (const lane of [0, 1, 2] as const) expect(hits(track, ballAt(100, lane))).toBe(1);
    expect(hits(track, ballAt(100, 1, JUMP_APEX_M))).toBe(0);
  });

  it('a wet floor sign and a returning ball are hit even at jump apex: they are not jumpable', () => {
    expect(hits(trackWith({ kind: 'wet-floor-sign', lane: 1, z: 100 }), ballAt(100, 1, JUMP_APEX_M))).toBe(1);
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
    const track = trackWith({ kind: 'wet-floor-sign', lane: 1, z: 100 });
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
  it('drops 8 m/s to 6.4 m/s, then is back on the target speed within 1.5 s', () => {
    // Where a clean ball rolls at 8 m/s: 10 · e^(−k·z) = 8.
    const z8 = Math.log(RELEASE_SPEED_MPS / 8) / ROLL_DRAG_PER_M;
    const track = trackWith({ kind: 'wet-floor-sign', lane: 1, z: z8 + 0.1 });
    let world: World = { ...initialWorld(track, z8), run: { ...runStateAt(z8), speedMps: 8 } };
    let speedAfter = 0;
    for (let i = 0; i < 10 && speedAfter === 0; i += 1) {
      const result = worldStep(world, track, 'stay', SIM_STEP_S);
      world = result.world;
      if (result.events.length > 0) speedAfter = world.run.speedMps;
    }
    expect(speedAfter).toBeCloseTo(6.4, 1);
    for (let i = 0; i < Math.round(1.5 / SIM_STEP_S); i += 1) world = worldStep(world, track, 'stay', SIM_STEP_S).world;
    expect(world.run.speedMps).toBeCloseTo(targetSpeed(world.run.z), 6);
  });

  it('pushes every impact of a run to the same side, by a bounded amount', () => {
    for (const seed of [1, 7, 58, 1001]) {
      const errors = [0, 1, 2, 3, 4].map((index) => aimErrorOf(seed, index));
      expect(new Set(errors.map(Math.sign)).size).toBe(1);
      for (const e of errors) {
        expect(Math.abs(e)).toBeGreaterThanOrEqual(IMPACT_AIM_ERROR_MIN_M);
        expect(Math.abs(e)).toBeLessThanOrEqual(IMPACT_AIM_ERROR_M);
      }
    }
  });

  it('gives the same aim error for the same track, seed and commands', () => {
    expect(aimErrorOf(7, 3)).toBe(aimErrorOf(7, 3));
    expect(aimErrorOf(7, 3)).not.toBe(aimErrorOf(7, 4));
    const track = trackWith({ kind: 'wet-floor-sign', lane: 1, z: 60 }, { kind: 'rental-shoes', lane: 1, z: 85 });
    const runOnce = () => {
      let world = initialWorld(track, 40);
      for (let i = 0; i < 1200; i += 1) world = worldStep(world, track, 'stay', SIM_STEP_S).world;
      return world.impacts;
    };
    expect(runOnce()).toEqual(runOnce());
    expect(runOnce().count).toBe(2);
  });
});
