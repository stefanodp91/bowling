import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CENTRE_LANE, laneCentreX } from '@models/measures/lane';
import { describe, expect, it } from 'vitest';
import { SKILL_PROFILES, SKILLS } from '../config/pilot';
import { SIM_STEP_S } from '../config/run';
import { MIN_REACTION_S } from '../config/track';
import { runStateAt } from '../domain/run/step';
import { initialWorld, worldStep, type World } from '../domain/simulation';
import { parseTrack } from '../domain/track/parse';
import type { Obstacle, Track } from '../domain/track/schema';
import { createAutopilot } from './command-source';
import { simulateRun } from './simulate-run';

const TRACKS_DIR = join(import.meta.dirname, '../../public/tracks');
const committedTracks = (): Track[] =>
  readdirSync(TRACKS_DIR)
    .filter((f) => f.startsWith('lane-'))
    .map((f) => {
      const parsed = parseTrack(JSON.parse(readFileSync(join(TRACKS_DIR, f), 'utf8')));
      if (!parsed.ok) throw new Error(`${f}: ${parsed.error}`);
      return parsed.value;
    });
const SEED = 1;
const trackWith = (...obstacles: Obstacle[]): Track => ({ schemaVersion: 1, trackId: 't', seed: 3, lengthM: 500, lanes: 3, obstacles });

/** Drives a constructed case with the perfect pilot from `startZ` until the ball passes `untilZ`. */
function drive(track: Track, startZ: number, untilZ: number, lane: 0 | 1 | 2 = CENTRE_LANE): World {
  const pilot = createAutopilot(SEED);
  let world: World = { ...initialWorld(track), run: { ...runStateAt(startZ), lane, x: laneCentreX(lane) } };
  while (world.run.z < untilZ && world.run.phase === 'rolling') world = worldStep(world, track, pilot(world.run, track, 'perfect'), SIM_STEP_S).world;
  return world;
}

describe('autopilot and tracks agree', () => {
  it('every profile notices obstacles at least MIN_REACTION_S ahead', () => {
    for (const skill of SKILLS) expect(SKILL_PROFILES[skill].noticeS).toBeGreaterThanOrEqual(MIN_REACTION_S);
  });
});

describe('simulateRun on the committed tracks', { timeout: 120_000 }, () => {
  it('perfect: zero impacts and the centre lane at the hand-over, on every track', () => {
    for (const track of committedTracks()) {
      const summary = simulateRun(track, 'perfect', SEED);
      expect({ track: track.trackId, impacts: summary.impacts, lane: summary.lane }).toEqual({ track: track.trackId, impacts: 0, lane: CENTRE_LANE });
    }
  });

  it('sloppy: at least one impact across the five tracks, and the same summary twice', () => {
    const summaries = committedTracks().map((track) => simulateRun(track, 'sloppy', SEED));
    expect(summaries.reduce((sum, s) => sum + s.impacts, 0)).toBeGreaterThanOrEqual(1);
    expect(committedTracks().map((track) => simulateRun(track, 'sloppy', SEED))).toEqual(summaries);
  });
});

describe('constructed cases', () => {
  it('avoids a returning ball that is nearer in time than a still obstacle nearer in distance', () => {
    // The shoes are 20 m ahead in lane 0; the ball rolls up lane 1 fast and meets the ball first.
    const track = trackWith({ kind: 'rental-shoes', lane: 0, z: 120 }, { kind: 'returning-ball', lane: 1, z: 140, speedMps: 4 });
    const world = drive(track, 100, 125);
    expect(world.impacts.count).toBe(0);
  });

  it('two obstacles in two lanes at the same z lead to the third lane', () => {
    const track = trackWith({ kind: 'stray-pins', lane: 1, z: 120 }, { kind: 'stray-pins', lane: 2, z: 120 });
    // At the crossing the ball is in lane 0; once past, the approach takes it back to the centre.
    expect(drive(track, 100, 120).run.lane).toBe(0);
    expect(drive(track, 100, 125).impacts.count).toBe(0);
  });

  it('a sweep bar leads to a jump that clears it', () => {
    const track = trackWith({ kind: 'sweep-bar', z: 120 });
    const pilot = createAutopilot(SEED);
    let world: World = { ...initialWorld(track), run: runStateAt(100) };
    let jumped = false;
    while (world.run.z < 121) {
      world = worldStep(world, track, pilot(world.run, track, 'perfect'), SIM_STEP_S).world;
      jumped ||= world.run.jump !== null;
    }
    expect(jumped).toBe(true);
    expect(world.impacts.count).toBe(0);
  });

  it('a widening gutter is left before it starts', () => {
    const track = trackWith({ kind: 'widening-gutter', lane: 1, z: 120, lengthM: 12 });
    const world = drive(track, 100, 119.9);
    expect(world.run.lane).not.toBe(1);
    expect(drive(track, 100, 135).impacts.count).toBe(0);
  });
});
