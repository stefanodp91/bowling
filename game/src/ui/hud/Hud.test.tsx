// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { GameSnapshot } from '../../app/snapshot';
import { createStore } from '../../app/store';
import type { Skill } from '../../config/pilot';
import { initI18n } from '../../i18n';
import { StartMenu } from '../menu/StartMenu';
import { EndScreen } from './EndScreen';
import { Hud } from './Hud';

const rolling: GameSnapshot = {
  ready: true,
  waiting: false,
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

const TRACKS = ['lane-01', 'lane-02', 'lane-03', 'lane-04', 'lane-05'] as const;

beforeAll(() => {
  initI18n();
});
afterEach(cleanup);

function renderHud() {
  const store = createStore(rolling);
  render(<Hud session={{ store }} onMenu={() => {}} sound={{ on: false, toggle: () => {} }} />);
}

/** The start menu with its own state, as the App holds it. */
function MenuHarness({ onStart }: { readonly onStart: (track: string, skill: Skill) => void }) {
  const [track, setTrack] = useState('lane-01');
  const [skill, setSkill] = useState<Skill>('perfect');
  return <StartMenu tracks={TRACKS} track={track} skill={skill} onTrack={setTrack} onSkill={setSkill} onStart={() => onStart(track, skill)} />;
}

describe('start menu', () => {
  it('choosing Dummy and a track, then Start, starts that track with that skill', () => {
    const onStart = vi.fn();
    render(<MenuHarness onStart={onStart} />);
    fireEvent.click(screen.getByRole('button', { name: /Dummy/ }));
    fireEvent.click(screen.getByRole('button', { name: 'lane-03' }));
    expect(screen.getByRole('button', { name: /Dummy/ }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: /Perfect/ }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('button', { name: 'lane-03' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(onStart).toHaveBeenCalledWith('lane-03', 'dummy');
  });
});

describe('HUD', () => {
  it('has no skill buttons during the run, and names the active skill', () => {
    renderHud();
    expect(screen.queryByRole('button', { name: /Perfect|Dummy/ })).toBeNull();
    expect(screen.queryByText('Autopilot: Perfect')).not.toBeNull();
  });

  it('shows the distance as a progress bar', () => {
    renderHud();
    expect(screen.getByRole('progressbar').getAttribute('value')).toBe('150');
  });
});

describe('end screen', () => {
  it('shows STRIKE! for ten pins', () => {
    render(<EndScreen pinsDown={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} impacts={0} skill="perfect" onMenu={() => {}} />);
    expect(screen.queryByText('STRIKE!')).not.toBeNull();
    expect(screen.queryByText('10 / 10')).not.toBeNull();
  });

  it('does not show STRIKE! for nine', () => {
    render(<EndScreen pinsDown={[1, 2, 3, 4, 5, 6, 7, 9, 10]} impacts={2} skill="dummy" onMenu={() => {}} />);
    expect(screen.queryByText('STRIKE!')).toBeNull();
    expect(screen.queryByText('9 / 10')).not.toBeNull();
  });
});
