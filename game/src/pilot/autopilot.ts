import { CENTRE_LANE } from '@models/measures/lane';
import { GROUP_WINDOW_S, IGNORE_SALT, SKILL_PROFILES, type Skill } from '../config/pilot';
import { seededRandom } from '../domain/random';
import type { Command, RunState } from '../domain/run/state';
import type { Track } from '../domain/track/schema';
import { candidates, clears } from './plan';
import { timeToMeet } from './time-to-meet';

/** What the pilot remembers between steps: which obstacles it noticed, and which it chose to ignore. */
export interface PilotMemory {
  readonly ignored: ReadonlyMap<number, boolean>;
}

export const emptyMemory: PilotMemory = { ignored: new Map() };

export interface PilotInput {
  readonly track: Track;
  readonly run: RunState;
  readonly skill: Skill;
  /** The run's seed: ignore draws are keyed by it and by the obstacle index (rule 5). */
  readonly seed: number;
  readonly memory: PilotMemory;
}

/** The ignore draw for obstacle `index`: the same seed always gives the same answer. */
export function ignoresObstacle(seed: number, index: number, chance: number): boolean {
  return seededRandom((seed ^ IGNORE_SALT) + index)() < chance;
}

/**
 * One decision (rule 1): pure — the same input gives the same command and memory. Reads only the
 * track and the run, never the scene (rule 2).
 */
export function decide({ track, run, skill, seed, memory }: PilotInput): { command: Command; memory: PilotMemory } {
  if (run.phase !== 'rolling') return { command: 'stay', memory };
  const profile = SKILL_PROFILES[skill];
  const ignored = new Map(memory.ignored);
  const ahead = track.obstacles
    .map((obstacle, index) => ({ obstacle, index, ttm: timeToMeet(obstacle, run) }))
    .filter((o): o is { obstacle: typeof o.obstacle; index: number; ttm: number } => o.ttm !== null)
    .sort((a, b) => a.ttm - b.ttm);
  for (const o of ahead) {
    if (o.ttm <= profile.noticeS && !ignored.has(o.index)) ignored.set(o.index, ignoresObstacle(seed, o.index, profile.ignoreChance));
  }
  const nextMemory: PilotMemory = { ignored };
  const problems = ahead.filter((o) => ignored.get(o.index) === false);
  const first = problems[0];
  if (first === undefined) {
    // Nothing to dodge: once no obstacle is left ahead, the approach is the centre lane (rule 6).
    const approach: Command = ahead.length > 0 || run.lane === CENTRE_LANE ? 'stay' : run.lane > CENTRE_LANE ? 'left' : 'right';
    return { command: approach, memory: nextMemory };
  }
  const group = problems.filter((o) => o.ttm - first.ttm <= GROUP_WINDOW_S);
  const horizonS = Math.max(...group.map((o) => o.ttm));
  const obstacles = group.map((o) => o.obstacle);
  const command = candidates(run).find((c) => clears(run, c, obstacles, horizonS)) ?? 'stay';
  return { command, memory: nextMemory };
}
