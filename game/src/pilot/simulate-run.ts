import type { LaneIndex } from '@models/measures/lane';
import type { Skill } from '../config/pilot';
import { SIM_STEP_S } from '../config/run';
import { handOffX } from '../domain/deck/hand-off';
import { initialWorld, worldStep, type World } from '../domain/simulation';
import type { Track } from '../domain/track/schema';
import { createAutopilot } from './command-source';

/** What a run looks like when it reaches the pin deck (rule 7). */
export interface RunSummary {
  readonly trackId: string;
  readonly skill: Skill;
  readonly seed: number;
  readonly impacts: number;
  readonly speedAtHandOffMps: number;
  readonly lane: LaneIndex;
  /** Where the ball enters the deck: aim target plus aim error. */
  readonly handOffX: number;
  readonly aimErrorM: number;
  /** Simulated seconds of rolling. */
  readonly rollingS: number;
}

/** No run lasts longer than this many steps: two minutes at the fixed step. */
const MAX_STEPS = Math.round(120 / SIM_STEP_S);

/**
 * The domain without a browser (rule 7): run, impacts and the autopilot from the foul line to the
 * hand-over. Tests and tools use it; the browser's runs must agree with it on impacts.
 */
export function simulateRun(track: Track, skill: Skill, seed: number): RunSummary {
  const pilot = createAutopilot(seed);
  let world: World = initialWorld(track);
  for (let i = 0; i < MAX_STEPS && (world.run.phase === 'ready' || world.run.phase === 'rolling'); i += 1) {
    world = worldStep(world, track, pilot(world.run, track, skill), SIM_STEP_S).world;
  }
  return {
    trackId: track.trackId,
    skill,
    seed,
    impacts: world.impacts.count,
    speedAtHandOffMps: world.run.speedMps,
    lane: world.run.lane,
    handOffX: handOffX(world, skill, track.seed),
    aimErrorM: world.impacts.aimErrorM,
    rollingS: world.run.runS,
  };
}
