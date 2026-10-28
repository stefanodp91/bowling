import { describe, expect, it } from 'vitest';
import type { GameSnapshot } from '../../app/snapshot';
import { initI18n } from '../../i18n';
import { sameContent, scoreboardContent } from './scoreboard-content';

const t = initI18n().t;
const rolling: GameSnapshot = {
  ready: true,
  waiting: false,
  trackId: 'lane-03',
  phase: 'rolling',
  phaseS: 3,
  z: 84.6,
  x: 0,
  speedMps: 8,
  lane: 1,
  impacts: 2,
  skill: 'dummy',
  score: null,
  pinsDown: null,
  resultSkill: null,
  runS: 10,
  seed: 1003,
  handOffSpeedMps: null,
  aimErrorM: 0,
};

describe('the scoreboard live screen', () => {
  it('shows the lane, the skill, the impacts and the distance while the run is on', () => {
    expect(scoreboardContent(rolling, t)).toEqual({
      title: 'Lane 3 · lane-03',
      subtitle: 'Autopilot: Dummy',
      detail: 'Impacts: 2',
      score: '85 m',
      pinsDown: null,
    });
  });

  it('shows the score once judged, STRIKE! for ten, and the skill of the hand-over', () => {
    const six = scoreboardContent({ ...rolling, phase: 'result', pinsDown: [1, 2, 3, 5, 8, 9], resultSkill: 'perfect' }, t);
    expect([six.score, six.subtitle, six.pinsDown]).toEqual(['6 / 10', 'Autopilot: Perfect', [1, 2, 3, 5, 8, 9]]);
    expect(scoreboardContent({ ...rolling, phase: 'result', pinsDown: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, t).score).toBe('STRIKE!');
  });

  it('redraws only when something it shows changes', () => {
    const a = scoreboardContent(rolling, t);
    expect(sameContent(a, scoreboardContent({ ...rolling, z: 84.9, speedMps: 7 }, t))).toBe(true);
    expect(sameContent(a, scoreboardContent({ ...rolling, z: 86 }, t))).toBe(false);
  });
});
