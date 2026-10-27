import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { describe, expect, it } from 'vitest';
import { ALLEY_HALF_WIDTH_M, ALLEY_INNER_X_M, CAPPING_WIDTH_M, CEILING_HEIGHT_M, NEIGHBOUR_LANE_WIDTH_M, neighbourLaneCentreX } from '../measures/alley';
import { PLAYING_SURFACE_WIDTH_M, SEGMENT_LENGTH_M } from '../measures/lane';
import { createAlleySegment } from './alley-segment';

describe('alley segment', () => {
  it('spans the room, from wall to wall and floor to ceiling, one segment long', () => {
    const scene = new Scene(new NullEngine());
    const { min, max } = createAlleySegment(scene, {}).root.getHierarchyBoundingVectors();
    expect(max.x).toBeCloseTo(ALLEY_HALF_WIDTH_M, 6);
    expect(min.x).toBeCloseTo(-ALLEY_HALF_WIDTH_M, 6);
    expect(max.y).toBeCloseTo(CEILING_HEIGHT_M, 6);
    expect(max.z).toBeGreaterThanOrEqual(SEGMENT_LENGTH_M - 1e-6);
  });

  it('starts beside the playing surface and keeps the neighbouring lanes clear of each other', () => {
    expect(ALLEY_INNER_X_M).toBeCloseTo(PLAYING_SURFACE_WIDTH_M / 2, 9);
    const gap = neighbourLaneCentreX(1) - neighbourLaneCentreX(0);
    expect(gap).toBeCloseTo(NEIGHBOUR_LANE_WIDTH_M + CAPPING_WIDTH_M, 9);
  });

  it('is two meshes, instanced without cloning geometry', () => {
    const scene = new Scene(new NullEngine());
    const segment = createAlleySegment(scene, {});
    expect(segment.root.getChildMeshes()).toHaveLength(2);
    const before = scene.geometries.length;
    segment.instantiate('copy');
    expect(scene.geometries.length).toBe(before);
  });
});
