import type { GameEvent } from '../app/events';
import {
  CLACK_MIN_SPEED_MPS,
  CLACK_VARIANTS,
  CLACK_VOLUME,
  IMPACT_VOLUME,
  MAX_CLACKS_PER_S,
  ROLL_FAST_AT_MPS,
  ROLL_MAX_VOLUME,
  ROLL_SLOW_AT_MPS,
  STRIKE_VOLUME,
} from '../config/audio';
import { STRIKE_PINS } from '../config/pins';

/** The sound files (scripts/audio/sounds.mjs). */
export const CUE_IDS = ['impact', 'strike', ...Array.from({ length: CLACK_VARIANTS }, (_, i) => `pin-clack-${i + 1}`)] as const;
export const ROLL_IDS = ['roll-slow', 'roll-fast'] as const;
export type CueId = string;

export interface Cue {
  readonly id: CueId;
  readonly volume: number;
}

/** Clacks heard in the current one-second window, so a strike stays under MAX_CLACKS_PER_S. */
export interface ClackBudget {
  readonly windowStartS: number;
  readonly used: number;
}

export const freshBudget: ClackBudget = { windowStartS: 0, used: 0 };

const ONE_SECOND = 1;

/**
 * Which cues a batch of events makes (rule 3), pure: an impact thuds; a pin contact above
 * CLACK_MIN_SPEED_MPS clacks (variants in turn), at most MAX_CLACKS_PER_S per second; a result of
 * ten plays the strike.
 */
export function cuesFor(events: readonly GameEvent[], budget: ClackBudget): { cues: Cue[]; budget: ClackBudget } {
  let current = budget;
  const cues: Cue[] = [];
  for (const event of events) {
    switch (event.kind) {
      case 'impact':
        cues.push({ id: 'impact', volume: IMPACT_VOLUME });
        break;
      case 'pin-contact': {
        if (event.speedMps < CLACK_MIN_SPEED_MPS) break;
        if (event.atS - current.windowStartS >= ONE_SECOND) current = { windowStartS: event.atS, used: 0 };
        if (current.used >= MAX_CLACKS_PER_S) break;
        cues.push({ id: `pin-clack-${(current.used % CLACK_VARIANTS) + 1}`, volume: CLACK_VOLUME });
        current = { ...current, used: current.used + 1 };
        break;
      }
      case 'result':
        if (event.score === STRIKE_PINS) cues.push({ id: 'strike', volume: STRIKE_VOLUME });
        break;
    }
  }
  return { cues, budget: current };
}

/** The rolling rumble's two bands by speed (rule 3): slow fades to fast between the two speeds. */
export function rollMix(speedMps: number, rolling: boolean): { slow: number; fast: number } {
  if (!rolling) return { slow: 0, fast: 0 };
  const t = Math.min(1, Math.max(0, (speedMps - ROLL_SLOW_AT_MPS) / (ROLL_FAST_AT_MPS - ROLL_SLOW_AT_MPS)));
  return { slow: ROLL_MAX_VOLUME * Math.cos((t * Math.PI) / 2), fast: ROLL_MAX_VOLUME * Math.sin((t * Math.PI) / 2) };
}
