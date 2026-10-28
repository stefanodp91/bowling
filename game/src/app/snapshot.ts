import type { LaneIndex } from '@models/measures/lane';
import type { PinNumber } from '@models/measures/pins';
import type { Skill } from '../config/pilot';
import type { RunPhase } from '../domain/run/state';

/**
 * What the outside sees of a run: the HUD through the store, headless tools through
 * window.__bowling (wiki/game/run.md, rule 8). Read-only, plain values.
 */
export interface GameSnapshot {
  readonly ready: boolean;
  /** The run is held at the foul line while the start menu is open. */
  readonly waiting: boolean;
  readonly trackId: string;
  readonly phase: RunPhase;
  /** Seconds in the current phase (the countdown reads it). */
  readonly phaseS: number;
  readonly z: number;
  readonly x: number;
  readonly speedMps: number;
  readonly lane: LaneIndex;
  readonly impacts: number;
  readonly skill: Skill;
  /** Pins down once known (0–10), else null. */
  readonly score: number | null;
  /** Which pins are down, once judged. */
  readonly pinsDown: readonly PinNumber[] | null;
  /** The skill active at the hand-over to the pin deck: the one the end screen reports. */
  readonly resultSkill: Skill | null;
  /** Simulated seconds since rolling began. */
  readonly runS: number;
  /** The run's seed (ignore draws, blind commands). */
  readonly seed: number;
  /** Speed and lateral aim error when the ball was handed to the deck; null before. */
  readonly handOffSpeedMps: number | null;
  readonly aimErrorM: number;
}
