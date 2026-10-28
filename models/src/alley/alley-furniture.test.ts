import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { describe, expect, it } from 'vitest';
import { ALLEY_HALF_WIDTH_M, BALL_RETURN_BALLS, BALL_RETURN_HOOD_HEIGHT_M, CEILING_HEIGHT_M, MASKING_UNIT_BOTTOM_M, SCOREBOARD_BOTTOM_M, SCOREBOARD_HEIGHT_M } from '../measures/alley';
import { PLAYING_SURFACE_WIDTH_M } from '../measures/lane';
import { createBallReturn } from './ball-return';
import { PLAYING_LANE_NUMBER, scoreboardScreens } from './scoreboard-layout';

describe('scoreboard layout', () => {
  it('hangs a screen over every lane, the live one over the playing surface, none touching', () => {
    const screens = scoreboardScreens();
    expect(screens.map((s) => s.laneNumber)).toEqual([1, 2, 3, 4, 5]);
    expect(screens.filter((s) => s.live)).toEqual([expect.objectContaining({ centreX: 0, laneNumber: PLAYING_LANE_NUMBER })]);
    expect(screens.find((s) => s.live)?.widthM).toBeLessThan(PLAYING_SURFACE_WIDTH_M);
    screens.slice(1).forEach((s, i) => {
      const before = screens[i];
      expect(s.centreX - s.widthM / 2).toBeGreaterThan((before?.centreX ?? 0) + (before?.widthM ?? 0) / 2);
    });
    const last = screens[screens.length - 1];
    expect((last?.centreX ?? 0) + (last?.widthM ?? 0) / 2).toBeLessThan(ALLEY_HALF_WIDTH_M);
  });

  it('sits over the masking unit, under the ceiling', () => {
    expect(SCOREBOARD_BOTTOM_M).toBeGreaterThan(MASKING_UNIT_BOTTOM_M);
    expect(SCOREBOARD_BOTTOM_M + SCOREBOARD_HEIGHT_M).toBeLessThan(CEILING_HEIGHT_M);
  });
});

describe('ball return', () => {
  it('carries its house balls on the rack, the hood standing on the floor', () => {
    const scene = new Scene(new NullEngine());
    const machine = createBallReturn(scene, { scenery: 'retro' }).root;
    const balls = machine.getChildMeshes().filter((m) => m.name.startsWith('ball-return-ball-'));
    expect(balls).toHaveLength(BALL_RETURN_BALLS);
    const { min, max } = machine.getHierarchyBoundingVectors();
    expect(min.y).toBeCloseTo(0, 6);
    expect(max.y).toBeCloseTo(BALL_RETURN_HOOD_HEIGHT_M, 6);
  });
});
