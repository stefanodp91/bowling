import { parseTrack } from '../domain/track/parse';
import { trackIndexSchema, type Track } from '../domain/track/schema';

/** Where the committed tracks are served (game/public/tracks, wiki/track/track-format.md). */
const TRACKS_URL = 'tracks';
const INDEX_FILE = 'index.json';

/** A failure that stops the start; `detail` names the track or the field (rule 4). */
export class TrackLoadError extends Error {
  constructor(
    readonly reason: 'not-found' | 'invalid',
    readonly detail: string,
  ) {
    super(`${reason}: ${detail}`);
  }
}

/** Fetch is a port: the game passes the browser's, tests pass a fake. */
export type Fetch = (url: string) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

export interface LoadedTrack {
  readonly track: Track;
  /** Every track id in play order, for «Run again» (wiki/game/hud.md, rule 4). */
  readonly playOrder: readonly string[];
}

/** Loads `id` (default: the first in index.json) and validates it; never falls back to an empty lane. */
export async function loadTrack(fetchJson: Fetch, id?: string): Promise<LoadedTrack> {
  const indexResponse = await fetchJson(`${TRACKS_URL}/${INDEX_FILE}`);
  if (!indexResponse.ok) throw new TrackLoadError('not-found', INDEX_FILE);
  const index = trackIndexSchema.safeParse(await indexResponse.json());
  if (!index.success) throw new TrackLoadError('invalid', INDEX_FILE);
  const trackId = id ?? index.data.tracks[0] ?? '';
  if (!index.data.tracks.includes(trackId)) throw new TrackLoadError('not-found', trackId);
  const response = await fetchJson(`${TRACKS_URL}/${trackId}.json`);
  if (!response.ok) throw new TrackLoadError('not-found', trackId);
  const parsed = parseTrack(await response.json());
  if (!parsed.ok) throw new TrackLoadError('invalid', `${trackId}: ${parsed.error}`);
  return { track: parsed.value, playOrder: index.data.tracks };
}
