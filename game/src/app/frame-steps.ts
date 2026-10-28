import { MAX_STEPS_PER_FRAME } from '../config/loop';
import { SIM_STEP_S } from '../config/run';

/** How many fixed steps a rendered frame runs, and the time left over for the next frame. */
export interface FrameSteps {
  readonly steps: number;
  readonly carryS: number;
  /** Fraction of a step the render is past the last step: for interpolation (rule 2). */
  readonly alpha: number;
}

/**
 * The fixed-step clock (wiki/game/run.md, rules 2 and 7). In real time, a frame runs as many
 * SIM_STEP_S steps as fit in the elapsed time plus the carry. With `speedup`, a frame runs exactly
 * that many steps whatever the time: it multiplies the number of steps, never their length.
 * `timeScale` (slow motion) stretches how much real time one step covers.
 */
export function frameSteps(carryS: number, frameS: number, speedup: number | undefined, timeScale = 1): FrameSteps {
  if (speedup !== undefined) return { steps: speedup, carryS: 0, alpha: 1 };
  const available = carryS + frameS * timeScale;
  const steps = Math.min(MAX_STEPS_PER_FRAME, Math.floor(available / SIM_STEP_S));
  const left = steps === MAX_STEPS_PER_FRAME ? 0 : available - steps * SIM_STEP_S;
  return { steps, carryS: left, alpha: left / SIM_STEP_S };
}
