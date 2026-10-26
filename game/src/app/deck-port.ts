import type { PinNumber } from '@models/measures/pins';
import type { PinPose } from '../domain/scoring/knocked-down';

/** The ball as it leaves the run for the deck (wiki/game/pins.md, rule 1). */
export interface HandOff {
  /** Lateral position: the aim target plus the aim error of the impacts. */
  readonly x: number;
  readonly speedMps: number;
}

/** The pin deck as the session sees it: implemented by the scene's physics, faked in tests. */
export interface DeckPort {
  handOff(ball: HandOff): void;
  /** Whether the ball has touched a pin since the hand-over. */
  contacted(): boolean;
  /** Each pin's pose relative to the head pin spot. */
  pinPoses(): ReadonlyMap<PinNumber, PinPose>;
}

/** Physics advanced by the simulation, one fixed step at a time. */
export interface PhysicsPort {
  step(): void;
}
