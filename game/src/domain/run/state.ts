import type { LaneIndex } from '@models/measures/lane';

/** The phases of a run, in order (wiki/game/run.md, rule 1). */
export const RUN_PHASES = ['ready', 'rolling', 'deck', 'settling', 'result'] as const;
export type RunPhase = (typeof RUN_PHASES)[number];

/** What the autopilot may ask at each step (rule 2). */
export const COMMANDS = ['stay', 'left', 'right', 'jump'] as const;
export type Command = (typeof COMMANDS)[number];

/** A lane change in progress: from one travel lane to an adjacent one. */
export interface LaneChange {
  readonly from: LaneIndex;
  readonly to: LaneIndex;
  readonly elapsedS: number;
}

/** A jump in progress. */
export interface Jump {
  readonly elapsedS: number;
}

/** The whole state of a run: a plain value, so a step is a pure function of it. */
export interface RunState {
  readonly phase: RunPhase;
  /** Seconds spent in the current phase. */
  readonly phaseS: number;
  /** Seconds since rolling began: the clock of returning balls (wiki/game/impacts.md, rule 1). */
  readonly runS: number;
  /** Distance from the foul line, metres. */
  readonly z: number;
  /** Lateral position of the ball's centre, metres (0 = centre lane). */
  readonly x: number;
  /** Height of the ball's lowest point above the lane, metres. */
  readonly y: number;
  readonly speedMps: number;
  /** The travel lane the ball is in, or is moving to during a change. */
  readonly lane: LaneIndex;
  readonly laneChange: LaneChange | null;
  /**
   * The latest lane change, its clock still running after it ended: the chase camera follows it
   * with a delay, as a pure function of the state (wiki/game/camera.md, rule 1).
   */
  readonly lastLaneChange: LaneChange | null;
  readonly jump: Jump | null;
  /** How far the ball has turned about its axle, radians (ω = v / r, rule 6). */
  readonly rollRad: number;
}

export const isAirborne = (state: RunState): boolean => state.jump !== null;
