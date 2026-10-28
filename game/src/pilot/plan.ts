import { CENTRE_LANE } from '@models/measures/lane';
import { SIM_STEP_S } from '../config/run';
import { PLAN_TAIL_S } from '../config/pilot';
import { touches } from '../domain/impacts/collide';
import { placedBox } from '../domain/impacts/footprints';
import { step } from '../domain/run/step';
import type { Command, RunState } from '../domain/run/state';
import type { Obstacle } from '../domain/track/schema';

/** The candidates, in preference order (rule 4): stay, towards the centre, the other way, jump. */
export function candidates(run: RunState): Command[] {
  const towardsCentre: Command = run.lane > CENTRE_LANE ? 'left' : 'right';
  const away: Command = towardsCentre === 'left' ? 'right' : 'left';
  return ['stay', towardsCentre, away, 'jump'];
}

/**
 * Whether issuing `command` now and then staying clears every obstacle of the group: the short
 * future is simulated with the run's own step and the domain's own collision test (rule 2).
 */
export function clears(run: RunState, command: Command, group: readonly Obstacle[], horizonS: number): boolean {
  let state = step(run, command, SIM_STEP_S);
  const steps = Math.ceil((horizonS + PLAN_TAIL_S) / SIM_STEP_S);
  for (let i = 0; i < steps; i += 1) {
    if (state.phase !== 'rolling') return true;
    if (group.some((obstacle) => touches(state, placedBox(obstacle, state.runS)))) return false;
    state = step(state, 'stay', SIM_STEP_S);
  }
  return true;
}
