// The Node side of the agreement check: simulateRun on a committed track (run under tsx).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseTrack } from '../../game/src/domain/track/parse.ts';
import { simulateRun } from '../../game/src/pilot/simulate-run.ts';
import { TRACKS_DIR } from '../tracks/tracks.mjs';

export function loadCommittedTrack(id) {
  const parsed = parseTrack(JSON.parse(readFileSync(join(TRACKS_DIR, `${id}.json`), 'utf8')));
  if (!parsed.ok) throw new Error(`${id}: ${parsed.error}`);
  return parsed.value;
}

export function committedTrackIds() {
  return JSON.parse(readFileSync(join(TRACKS_DIR, 'index.json'), 'utf8')).tracks;
}

/** What simulateRun predicts for a run; the seed defaults to the track's, as in the game. */
export function predict(trackId, skill, seed) {
  const track = loadCommittedTrack(trackId);
  return simulateRun(track, skill, seed ?? track.seed);
}
