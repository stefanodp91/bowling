import { describe, expect, it } from 'vitest';
import type { GameEvent } from '../app/events';
import { MAX_CLACKS_PER_S, ROLL_FAST_AT_MPS, ROLL_MAX_VOLUME, ROLL_SLOW_AT_MPS } from '../config/audio';
import { cuesFor, freshBudget, rollMix } from './cues';

describe('event → cue mapping', () => {
  it('a scripted run with one impact and eight pins down: one thud, clacks, no strike', () => {
    const events: GameEvent[] = [
      { kind: 'impact', obstacle: 'stray-pins', speedMps: 9, atS: 12 },
      ...Array.from({ length: 6 }, (_, i): GameEvent => ({ kind: 'pin-contact', speedMps: 3, atS: 56 + i * 0.05 })),
      { kind: 'pin-contact', speedMps: 0.1, atS: 56.4 },
      { kind: 'result', score: 8, atS: 59 },
    ];
    const ids = cuesFor(events, freshBudget).cues.map((c) => c.id);
    expect(ids.filter((id) => id === 'impact')).toHaveLength(1);
    expect(ids.filter((id) => id.startsWith('pin-clack'))).toHaveLength(6);
    expect(ids).not.toContain('strike');
  });

  it('plays the strike for ten', () => {
    expect(cuesFor([{ kind: 'result', score: 10, atS: 60 }], freshBudget).cues.map((c) => c.id)).toEqual(['strike']);
  });

  it('caps clacks at MAX_CLACKS_PER_S in one second', () => {
    const burst = Array.from({ length: 40 }, (_, i): GameEvent => ({ kind: 'pin-contact', speedMps: 4, atS: 56 + i * 0.01 }));
    expect(cuesFor(burst, freshBudget).cues).toHaveLength(MAX_CLACKS_PER_S);
  });

  it('crossfades the rumble from the slow to the fast band', () => {
    expect(rollMix(ROLL_SLOW_AT_MPS, true)).toEqual({ slow: ROLL_MAX_VOLUME, fast: 0 });
    expect(rollMix(ROLL_FAST_AT_MPS, true).fast).toBeCloseTo(ROLL_MAX_VOLUME);
    expect(rollMix(ROLL_FAST_AT_MPS, false)).toEqual({ slow: 0, fast: 0 });
  });
});
