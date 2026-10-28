// Shared by bake and check-tracks: where the tracks live and how a track file is written.
// Imports the game's TypeScript: run with `node --import tsx` (TSX_TSCONFIG_PATH=game/tsconfig.json),
// as npm run bake:tracks and the gate runner do.
import { join } from 'node:path';
import { REPO_ROOT } from '../lib/gate.mjs';
import { TRACK_SEEDS } from '../../game/src/config/track.ts';
import { seededRandom } from '../../game/src/domain/random.ts';
import { generateTrack } from '../../game/src/domain/track/generate.ts';

export const TRACKS_DIR = join(REPO_ROOT, 'game/public/tracks');
export const INDEX_FILE = 'index.json';

/** The exact bytes of a JSON file as committed: two-space indent and a final newline. */
export const toFileText = (value) => `${JSON.stringify(value, null, 2)}\n`;

/** Every committed track, generated from its seed, keyed by id, in play order. */
export function bakedTracks() {
  return Object.entries(TRACK_SEEDS).map(([trackId, seed]) => generateTrack(trackId, seed, seededRandom(seed)));
}

export const bakedIndex = () => ({ tracks: Object.keys(TRACK_SEEDS) });
