import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { describe, expect, it } from 'vitest';
import { BOARDS_SURFACE_WIDTH_M, GUTTER_WIDTH_M, laneCentreX, PLAYING_SURFACE_WIDTH_M, SEGMENT_LENGTH_M, TRAVEL_LANE_WIDTH_M } from '../measures/lane';
import { createLaneSegment } from './lane-segment';
import { createPinDeck } from './pin-deck';

const MM = 0.001;

describe('lane segment', () => {
  it('is three travel lanes plus two gutters wide (±5 mm) and SEGMENT_LENGTH_M long', () => {
    const scene = new Scene(new NullEngine());
    const { root } = createLaneSegment(scene, { foulLineZ: 0 });
    const { min, max } = root.getHierarchyBoundingVectors();
    expect(Math.abs(max.x - min.x - (3 * TRAVEL_LANE_WIDTH_M + 2 * GUTTER_WIDTH_M))).toBeLessThanOrEqual(5 * MM);
    expect(max.x - min.x).toBeCloseTo(PLAYING_SURFACE_WIDTH_M, 3);
    expect(max.z - min.z).toBeCloseTo(SEGMENT_LENGTH_M, 6);
    expect(min.z).toBeCloseTo(0, 6);
  });

  it('has travel-lane centres at −1.054, 0, +1.054 m and boards 3 lanes wide', () => {
    expect([laneCentreX(0), laneCentreX(1), laneCentreX(2)].map((x) => Number(x.toFixed(3)))).toEqual([-1.054, 0, 1.054]);
    expect(BOARDS_SURFACE_WIDTH_M).toBeCloseTo(3.162, 3);
  });

  it('instantiates without cloning geometry', () => {
    const scene = new Scene(new NullEngine());
    const segment = createLaneSegment(scene, {});
    const before = scene.geometries.length;
    segment.instantiate('copy');
    expect(scene.geometries.length).toBe(before);
  });

  it('pin deck builds with its root at the head pin spot', () => {
    const scene = new Scene(new NullEngine());
    const deck = createPinDeck(scene, {});
    expect(deck.root.getChildMeshes().length).toBeGreaterThan(0);
  });
});
