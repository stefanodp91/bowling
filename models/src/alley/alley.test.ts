import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { describe, expect, it } from 'vitest';
import { ALLEY_HALF_WIDTH_M, ALLEY_INNER_X_M, MASKING_UNIT_BOTTOM_M, CAPPING_WIDTH_M, CEILING_HEIGHT_M, NEIGHBOUR_LANE_WIDTH_M, neighbourLaneCentreX } from '../measures/alley';
import { PLAYING_SURFACE_WIDTH_M, SEGMENT_LENGTH_M } from '../measures/lane';
import { PIN_HEIGHT_M } from '../measures/pins';
import { createAlleyEndWall } from './alley-end-wall';
import { createAlleySegment } from './alley-segment';
import { SCENERIES } from './scenery-themes';

describe('alley segment', () => {
  it('spans the room, from wall to wall and floor to ceiling, one segment long', () => {
    const scene = new Scene(new NullEngine());
    const { min, max } = createAlleySegment(scene, { scenery: 'retro' }).root.getHierarchyBoundingVectors();
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
    const segment = createAlleySegment(scene, { scenery: 'retro' });
    expect(segment.root.getChildMeshes()).toHaveLength(2);
    const before = scene.geometries.length;
    segment.instantiate('copy');
    expect(scene.geometries.length).toBe(before);
  });

  it.each(SCENERIES)('builds the %s room with colours of its own', (scenery) => {
    const scene = new Scene(new NullEngine());
    const decor = createAlleySegment(scene, { scenery }).root.getChildMeshes().find((m) => m.name === 'alley-decor');
    const colours = decor?.getVerticesData('color') ?? [];
    expect(colours.length).toBeGreaterThan(0);
    const other = createAlleySegment(scene, { scenery: scenery === 'retro' ? 'neon' : 'retro' }).root.getChildMeshes().find((m) => m.name === 'alley-decor');
    expect(Array.from(colours)).not.toEqual(Array.from(other?.getVerticesData('color') ?? []));
  });

  it.each(SCENERIES)('closes the %s room with an end wall across its whole width, floor to ceiling, facing the ball', (scenery) => {
    const scene = new Scene(new NullEngine());
    const wall = createAlleyEndWall(scene, { scenery }).root;
    wall.computeWorldMatrix(true);
    const { min, max } = wall.getHierarchyBoundingVectors();
    expect(min.x).toBeCloseTo(-ALLEY_HALF_WIDTH_M, 6);
    expect(max.x).toBeCloseTo(ALLEY_HALF_WIDTH_M, 6);
    expect(max.y).toBeCloseTo(CEILING_HEIGHT_M, 6);
    // Every painted layer stands on the ball's side of the wall, within a few centimetres of it.
    expect(max.z).toBeCloseTo(0, 6);
    expect(min.z).toBeGreaterThan(-0.1);
    expect(MASKING_UNIT_BOTTOM_M).toBeGreaterThan(PIN_HEIGHT_M);
  });
});
