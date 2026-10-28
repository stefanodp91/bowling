import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { describe, expect, it } from 'vitest';
import { createPlaceholder, PLACEHOLDER_EDGE_M } from './placeholder';

describe('placeholder model', () => {
  it('builds a unit cube resting on the ground', () => {
    const scene = new Scene(new NullEngine());
    const handle = createPlaceholder(scene, {});
    const { min, max } = handle.root.getHierarchyBoundingVectors();
    expect(max.x - min.x).toBeCloseTo(PLACEHOLDER_EDGE_M);
    expect(min.y).toBeCloseTo(0);
    handle.dispose();
    expect(scene.meshes).toHaveLength(0);
  });
});
