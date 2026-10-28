import { SETTLE_S } from '../../config/pins';
import type { PinNumber } from '@models/measures/pins';
import type { RunPhase } from '../run/state';

/** What happened on the pin deck so far (wiki/game/pins.md, rules 4–6). */
export interface DeckState {
  readonly handedOff: boolean;
  readonly sinceHandOffS: number;
  /** Seconds since the first ball–pin contact, or null before it. */
  readonly sinceContactS: number | null;
  /** The pins down, once judged; null until the result. */
  readonly pinsDown: readonly PinNumber[] | null;
}

export const initialDeck: DeckState = { handedOff: false, sinceHandOffS: 0, sinceContactS: null, pinsDown: null };

export type DeckVerdict = 'wait' | 'judge' | 'gutter';

/**
 * Advances the deck clock by one step and says what happens next: `judge` SETTLE_S after the first
 * contact, `gutter` (score 0) if no contact came within SETTLE_S of the hand-over (rule 6).
 */
export function advanceDeck(deck: DeckState, contactedNow: boolean, dtS: number): { deck: DeckState; verdict: DeckVerdict } {
  const sinceHandOffS = deck.sinceHandOffS + dtS;
  const sinceContactS = deck.sinceContactS !== null ? deck.sinceContactS + dtS : contactedNow ? 0 : null;
  const next = { ...deck, sinceHandOffS, sinceContactS };
  if (sinceContactS !== null && sinceContactS >= SETTLE_S) return { deck: next, verdict: 'judge' };
  if (sinceContactS === null && sinceHandOffS >= SETTLE_S) return { deck: next, verdict: 'gutter' };
  return { deck: next, verdict: 'wait' };
}

/** The run phase the deck implies (rule 1 of wiki/game/run.md): deck, settling once touched, result once judged. */
export function deckPhase(deck: DeckState): RunPhase {
  if (deck.pinsDown !== null) return 'result';
  return deck.sinceContactS === null ? 'deck' : 'settling';
}
