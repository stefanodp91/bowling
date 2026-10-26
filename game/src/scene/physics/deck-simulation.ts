import type { Scene } from '@babylonjs/core/scene';
import { createBall } from '@models';
import type { PinNumber } from '@models/measures/pins';
import { SIM_STEP_S } from '../../config/run';
import { advanceDeck, initialDeck } from '../../domain/deck/deck';
import { pinsDown } from '../../domain/scoring/knocked-down';
import { createPinsView } from '../views/pins-view';
import { createDeck } from './deck';
import type { HavokInstance } from './havok-loader';
import { createPhysicsWorld } from './physics-world';

export interface DeckOutcome {
  readonly pinsDown: readonly PinNumber[];
  /** Simulated seconds from the hand-over to the first contact, or null for a gutter ball. */
  readonly firstContactS: number | null;
  readonly steps: number;
}

/** The longest a deck simulation may run: hand-over to judgement can never exceed twice SETTLE_S. */
const MAX_STEPS = 10_000;

/**
 * One ball on a fresh deck, stepped at the fixed step until the deck verdict (wiki/game/pins.md):
 * the same deck, physics and rule the game uses. For tests and records (Babylon NullEngine works).
 */
export function simulateDeck(scene: Scene, havok: HavokInstance, ball: { x: number; speedMps: number }): DeckOutcome {
  const physics = createPhysicsWorld(scene, havok);
  const pins = createPinsView(scene);
  const ballModel = createBall(scene, { variant: 'player' });
  const deck = createDeck(scene, { ball: ballModel.root, pins: pins.pins, pinMesh: pins.pinMesh });
  deck.handOff(ball);
  let state = initialDeck;
  let firstContactS: number | null = null;
  let steps = 0;
  for (; steps < MAX_STEPS; steps += 1) {
    physics.step();
    const { deck: next, verdict } = advanceDeck(state, deck.contacted(), SIM_STEP_S);
    if (state.sinceContactS === null && next.sinceContactS !== null) firstContactS = next.sinceHandOffS;
    state = next;
    if (verdict !== 'wait') {
      const down = verdict === 'judge' ? pinsDown(deck.pinPoses()) : [];
      deck.dispose();
      physics.dispose();
      return { pinsDown: down, firstContactS, steps };
    }
  }
  throw new Error(`deck simulation did not finish in ${MAX_STEPS} steps`);
}
