import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { describe, expect, it } from 'vitest';
import { BALL_RADIUS_M } from '../../measures/ball';
import { createReturningBall } from './returning-ball';

describe('returning ball', () => {
  it('spins at ω = v / r towards the foul line, as a pure function of elapsed time', () => {
    const scene = new Scene(new NullEngine());
    const handle = createReturningBall(scene, { speedMps: 3 });
    const spin = handle.root.getChildTransformNodes(true)[0];
    handle.animate?.(2);
    handle.animate?.(2);
    expect(spin?.rotation.x).toBeCloseTo((-3 * 2) / BALL_RADIUS_M);
  });
});
