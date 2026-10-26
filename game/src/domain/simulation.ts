import { initialDeck, type DeckState } from './deck/deck';
import { applyImpacts, initialImpacts, type ImpactEvent, type ImpactState } from './impacts/impacts';
import { initialRunState, runStateAt, step } from './run/step';
import type { Command, RunState } from './run/state';
import type { Track } from './track/schema';

/** Everything that changes during a run before the pin deck: the run and what impacts did to it. */
export interface World {
  readonly run: RunState;
  readonly impacts: ImpactState;
  readonly deck: DeckState;
}

export function initialWorld(track: Track, startAtZ?: number): World {
  return { run: startAtZ === undefined ? initialRunState() : runStateAt(startAtZ), impacts: initialImpacts(track), deck: initialDeck };
}

/**
 * One fixed step of the whole simulation: the run's step, then impacts while rolling. Pure; the
 * scene, the session, the autopilot and simulateRun all call this one function.
 */
export function worldStep(world: World, track: Track, command: Command, dtS: number): { world: World; events: ImpactEvent[] } {
  const run = step(world.run, command, dtS);
  if (run.phase !== 'rolling') return { world: { ...world, run }, events: [] };
  const result = applyImpacts(run, world.impacts, track);
  return { world: { ...world, run: result.run, impacts: result.impacts }, events: result.events };
}
