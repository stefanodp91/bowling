import { describe, expect, it } from 'vitest';
import { DEFAULT_SCENERY, SCENERY_BY_TRACK, sceneryOf } from './scenery';
import { TRACK_SEEDS } from './track';

describe('the room of each track', () => {
  it('gives every committed track a room of its own', () => {
    const rooms = Object.keys(TRACK_SEEDS).map(sceneryOf);
    expect(new Set(rooms).size).toBe(Object.keys(TRACK_SEEDS).length);
    expect(Object.keys(SCENERY_BY_TRACK).sort()).toEqual(Object.keys(TRACK_SEEDS).sort());
  });

  it('gives any other track the first room', () => {
    expect(sceneryOf('lane-99')).toBe(DEFAULT_SCENERY);
  });
});
