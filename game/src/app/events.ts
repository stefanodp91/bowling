import type { Obstacle } from '../domain/track/schema';

/** What happened during one step, for the sound and anything else that reacts (wiki/audio/sounds.md). */
export type GameEvent =
  | { readonly kind: 'impact'; readonly obstacle: Obstacle['kind']; readonly speedMps: number; readonly atS: number }
  | { readonly kind: 'pin-contact'; readonly speedMps: number; readonly atS: number }
  | { readonly kind: 'result'; readonly score: number; readonly atS: number };
