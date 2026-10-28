// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { GameSnapshot } from '../../app/snapshot';
import { createStore } from '../../app/store';
import type { Skill } from '../../config/pilot';
import { initI18n } from '../../i18n';
import { EndScreen } from './EndScreen';
import { Hud } from './Hud';

const rolling: GameSnapshot = {
  ready: true,
  trackId: 'lane-01',
  phase: 'rolling',
  phaseS: 20,
  z: 150,
  x: 0,
  speedMps: 9,
  lane: 1,
  impacts: 1,
  skill: 'perfect',
  score: null,
  pinsDown: null,
  resultSkill: null,
  runS: 30,
  seed: 1,
  handOffSpeedMps: null,
  aimErrorM: 0,
};

beforeAll(() => {
  initI18n();
});
afterEach(cleanup);

function renderHud() {
  const store = createStore(rolling);
  const setSkill = vi.fn((skill: Skill) => store.set({ ...store.get(), skill }));
  render(<Hud session={{ store, setSkill }} onRunAgain={() => {}} sound={{ on: false, toggle: () => {} }} />);
  return { setSkill };
}

describe('HUD', () => {
  it('clicking Dummy mid-run dispatches the skill change and marks it pressed', () => {
    const { setSkill } = renderHud();
    fireEvent.click(screen.getByRole('button', { name: 'Dummy' }));
    expect(setSkill).toHaveBeenCalledWith('dummy');
    expect(screen.getByRole('button', { name: 'Dummy' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Perfect' }).getAttribute('aria-pressed')).toBe('false');
  });

  it.each([
    ['2', 'dummy', 'Dummy'],
    ['1', 'perfect', 'Perfect'],
  ] as const)('key %s selects %s', (key, skill, label) => {
    const { setSkill } = renderHud();
    fireEvent.keyDown(window, { key });
    expect(setSkill).toHaveBeenCalledWith(skill);
    expect(screen.getByRole('button', { name: label }).getAttribute('aria-pressed')).toBe('true');
  });

  it('shows the distance as a progress bar', () => {
    renderHud();
    expect(screen.getByRole('progressbar').getAttribute('value')).toBe('150');
  });
});

describe('end screen', () => {
  it('shows STRIKE! for ten pins', () => {
    render(<EndScreen pinsDown={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} impacts={0} skill="perfect" onRunAgain={() => {}} />);
    expect(screen.queryByText('STRIKE!')).not.toBeNull();
    expect(screen.queryByText('10 / 10')).not.toBeNull();
  });

  it('does not show STRIKE! for nine', () => {
    render(<EndScreen pinsDown={[1, 2, 3, 4, 5, 6, 7, 9, 10]} impacts={2} skill="dummy" onRunAgain={() => {}} />);
    expect(screen.queryByText('STRIKE!')).toBeNull();
    expect(screen.queryByText('9 / 10')).not.toBeNull();
  });
});
