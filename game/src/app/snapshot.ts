import type { LaneIndex } from '@models/measures/lane';
import type { Skill } from '../config/pilot';
import type { RunPhase } from '../domain/run/state';

/**
 * What the outside sees of a run: the HUD through the store, headless tools through
 * window.__bowling (wiki/game/run.md, rule 8). Read-only, plain values.
 */
export interface GameSnapshot {
  readonly ready: boolean;
  readonly trackId: string;
  readonly phase: RunPhase;
  readonly z: number;
  readonly x: number;
  readonly speedMps: number;
  readonly lane: LaneIndex;
  readonly impacts: number;
  readonly skill: Skill;
  /** Pins down once known (0–10), else null. */
  readonly score: number | null;
  /** Simulated seconds since rolling began. */
  readonly runS: number;
}
