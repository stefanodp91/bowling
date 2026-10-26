import type { Skill } from '../config/pilot';

/** The query of the next run: the next track in play order, wrapping around, same skill (hud rule 4). */
export function nextRunSearch(trackId: string, playOrder: readonly string[], skill: Skill): string {
  const next = playOrder[(playOrder.indexOf(trackId) + 1) % playOrder.length] ?? trackId;
  return new URLSearchParams({ track: next, skill }).toString();
}
