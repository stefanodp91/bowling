import { LANE_LENGTH_M } from '@models/measures/lane';
import { describe, expect, it } from 'vitest';
import type { Track } from '../domain/track/schema';
import { createSession } from './session';

const EMPTY_TRACK: Track = { schemaVersion: 1, trackId: 'empty', seed: 1, lengthM: LANE_LENGTH_M, lanes: 3, obstacles: [] };
/** A few rendered frames of a sixtieth of a second each. */
const FRAME_S = 1 / 60;
const FRAMES = 120;

describe('a session held by the start menu', () => {
  it('stays at the foul line in «ready» until start(), then counts down and rolls', () => {
    const session = createSession({ track: EMPTY_TRACK, skill: 'perfect', waitForStart: true });
    for (let i = 0; i < FRAMES; i += 1) session.frame(FRAME_S);
    expect(session.store.get()).toMatchObject({ waiting: true, phase: 'ready', phaseS: 0, z: 0 });
    session.start();
    for (let i = 0; i < FRAMES * 2; i += 1) session.frame(FRAME_S);
    expect(session.store.get()).toMatchObject({ waiting: false, phase: 'rolling' });
  });

  it('takes the skill the menu changes while it is held', () => {
    const session = createSession({ track: EMPTY_TRACK, skill: 'perfect', waitForStart: true });
    session.setSkill('dummy');
    expect(session.store.get().skill).toBe('dummy');
  });

  it('is not held when nothing asks for it', () => {
    const session = createSession({ track: EMPTY_TRACK, skill: 'perfect' });
    session.frame(FRAME_S);
    expect(session.store.get()).toMatchObject({ waiting: false });
    expect(session.store.get().phaseS).toBeGreaterThan(0);
  });

  it('holds a running run where it is, and lets it go on', () => {
    const session = createSession({ track: EMPTY_TRACK, skill: 'perfect' });
    for (let i = 0; i < FRAMES * 2; i += 1) session.frame(FRAME_S);
    session.hold();
    const held = session.store.get();
    for (let i = 0; i < FRAMES; i += 1) session.frame(FRAME_S);
    expect(session.store.get()).toEqual(held);
    session.start();
    session.frame(FRAME_S);
    expect(session.store.get().z).toBeGreaterThan(held.z);
  });
});
