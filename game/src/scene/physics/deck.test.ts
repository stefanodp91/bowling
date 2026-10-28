import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { beforeAll, describe, expect, it } from 'vitest';
import { POCKET_OFFSET_M } from '../../config/pins';
import { PIN_SPEED_MPS } from '../../config/run';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseTrack } from '../../domain/track/parse';
import { simulateRun } from '../../pilot/simulate-run';
import { simulateDeck, type DeckOutcome } from './deck-simulation';
import type { HavokInstance } from './havok-loader';
import { loadHavokInNode } from './havok-node';

/** A deck simulation runs up to ~4 s of physics at 480 substeps per second. */
const DECK_TEST_TIMEOUT_MS = 60_000;
/** The off-pocket ball of criterion 3: 0.5 m to the side of the head pin. */
const OFF_POCKET_M = 0.5;

let havok: HavokInstance;
beforeAll(async () => {
  havok = await loadHavokInNode();
});

const run = (x: number, speedMps = PIN_SPEED_MPS): DeckOutcome => simulateDeck(new Scene(new NullEngine()), havok, { x, speedMps });
const TRACKS_DIR = join(import.meta.dirname, '../../../public/tracks');
const committedTracks = () =>
  readdirSync(TRACKS_DIR)
    .filter((f) => f.startsWith('lane-'))
    .map((f) => {
      const parsed = parseTrack(JSON.parse(readFileSync(join(TRACKS_DIR, f), 'utf8')));
      if (!parsed.ok) throw new Error(`${f}: ${parsed.error}`);
      return parsed.value;
    });
/** A run's verdict: never a strike, never nothing (wiki/pilot/autopilot.md, criterion 3). */
const SOME_PINS = { min: 1, max: 9 } as const;

describe('pin deck in Havok (NullEngine, no browser)', () => {
  it('a pocket ball at the pin speed knocks down at least 8 pins', { timeout: DECK_TEST_TIMEOUT_MS }, () => {
    const outcome = run(POCKET_OFFSET_M);
    console.info(`DECK pocket: ${outcome.pinsDown.length} down [${outcome.pinsDown.join(',')}], contact after ${outcome.firstContactS?.toFixed(3)} s`);
    expect(outcome.pinsDown.length).toBeGreaterThanOrEqual(8);
  });

  it('a ball 0.5 m to the side of the head pin knocks down fewer pins than the pocket ball', { timeout: DECK_TEST_TIMEOUT_MS }, () => {
    const pocket = run(POCKET_OFFSET_M).pinsDown.length;
    const side = run(OFF_POCKET_M);
    console.info(`DECK side: ${side.pinsDown.length} down [${side.pinsDown.join(',')}]`);
    expect(side.pinsDown.length).toBeLessThan(pocket);
  });

  it('every dummy run of a committed track knocks down some pins, never all ten', { timeout: DECK_TEST_TIMEOUT_MS * 5 }, () => {
    for (const track of committedTracks()) {
      // The game's run seed is the track's own: the runs the audience sees.
      const summary = simulateRun(track, 'dummy', track.seed);
      const down = run(summary.handOffX, summary.speedAtHandOffMps).pinsDown.length;
      console.info(`DECK dummy ${track.trackId}: x ${summary.handOffX.toFixed(2)} m at ${summary.speedAtHandOffMps.toFixed(1)} m/s, ${down} down`);
      expect({ track: track.trackId, down: Math.min(SOME_PINS.max, Math.max(SOME_PINS.min, down)) }).toEqual({ track: track.trackId, down });
    }
  });

  it('two simulations with the same inputs give the same pins down', { timeout: DECK_TEST_TIMEOUT_MS }, () => {
    expect(run(POCKET_OFFSET_M)).toEqual(run(POCKET_OFFSET_M));
  });
});
