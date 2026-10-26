import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { describe, expect, it } from 'vitest';
import { SWEEP_BAR_FOOTPRINT } from '../../measures/obstacles';
import { PLAYING_SURFACE_WIDTH_M } from '../../measures/lane';
import { createSweepBar } from './sweep-bar';

const MM = 0.001;

describe('sweep bar', () => {
  it('spans the playing surface, sits on the lane, and never leaves its footprint while swinging', () => {
    const scene = new Scene(new NullEngine());
    const handle = createSweepBar(scene, { swingPeriodS: 2 });
    const parts = ['sweep-board', 'sweep-lip'].map((name) => scene.getMeshByName(name));
    for (const t of [0, 0.25, 0.5, 0.75, 1.3]) {
      handle.animate?.(t);
      for (const node of [handle.root, ...handle.root.getChildTransformNodes(false), ...handle.root.getChildMeshes(false)]) {
        node.computeWorldMatrix(true);
      }
      for (const part of parts) {
        if (part === null) throw new Error('sweep bar part missing');
        const { minimumWorld, maximumWorld } = part.getBoundingInfo().boundingBox;
        expect(maximumWorld.x - minimumWorld.x).toBeGreaterThanOrEqual(PLAYING_SURFACE_WIDTH_M);
        expect(Math.max(Math.abs(minimumWorld.z), Math.abs(maximumWorld.z))).toBeLessThanOrEqual(SWEEP_BAR_FOOTPRINT.halfDepthM + MM);
        expect(minimumWorld.y).toBeGreaterThanOrEqual(-MM);
        expect(maximumWorld.y).toBeLessThanOrEqual(SWEEP_BAR_FOOTPRINT.heightM + MM / 10);
      }
    }
  });
});
