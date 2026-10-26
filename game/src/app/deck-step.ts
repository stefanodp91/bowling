import { advanceDeck, deckPhase } from '../domain/deck/deck';
import { handOffX } from '../domain/deck/hand-off';
import { pinsDown } from '../domain/scoring/knocked-down';
import type { World } from '../domain/simulation';
import type { DeckPort } from './deck-port';

const DECK_PHASES = new Set(['deck', 'settling']);

/**
 * The deck's share of a step (wiki/game/pins.md): hand the ball to physics when the run reaches
 * the deck, then advance the deck clock and judge the pins when it says so. The run's phase
 * follows the deck: deck → settling at the first contact → result once judged.
 */
export function deckStep(world: World, deck: DeckPort, dtS: number): World {
  if (!DECK_PHASES.has(world.run.phase)) return world;
  if (!world.deck.handedOff) {
    deck.handOff({ x: handOffX(world), speedMps: world.run.speedMps });
    return { ...world, deck: { ...world.deck, handedOff: true } };
  }
  const { deck: advanced, verdict } = advanceDeck(world.deck, deck.contacted(), dtS);
  const judged = verdict === 'judge' ? pinsDown(deck.pinPoses()) : verdict === 'gutter' ? [] : null;
  const next = { ...advanced, pinsDown: judged };
  const phase = deckPhase(next);
  return { ...world, deck: next, run: phase === world.run.phase ? world.run : { ...world.run, phase, phaseS: 0 } };
}
