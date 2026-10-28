/**
 * Which room each track is played in (wiki/models/lane.md, rule 6): a human asked on 2026-10-28
 * that the scenery change with the chosen track. The themes themselves are models
 * (`models/src/alley/scenery-themes.ts`); a track not listed here gets the first one.
 */
import type { Scenery } from '@models';
import type { TRACK_SEEDS } from './track';

export const SCENERY_BY_TRACK = {
  'lane-01': 'retro',
  'lane-02': 'neon',
  'lane-03': 'space',
  'lane-04': 'tropical',
  'lane-05': 'diner',
} as const satisfies Readonly<Record<keyof typeof TRACK_SEEDS, Scenery>>;

/** The room of the first track, for any other. */
export const DEFAULT_SCENERY: Scenery = 'retro';

const isListed = (trackId: string): trackId is keyof typeof SCENERY_BY_TRACK => Object.hasOwn(SCENERY_BY_TRACK, trackId);

/** The room a track is played in. */
export function sceneryOf(trackId: string): Scenery {
  return isListed(trackId) ? SCENERY_BY_TRACK[trackId] : DEFAULT_SCENERY;
}
