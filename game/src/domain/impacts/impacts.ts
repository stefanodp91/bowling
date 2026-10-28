import { laneCentreX, LANE_INDICES, type LaneIndex } from '@models/measures/lane';
import { AIM_ERROR_SALT, AIM_SIDE_SALT, IMPACT_AIM_ERROR_M, IMPACT_AIM_ERROR_MIN_M, IMPACT_SPEED_LOSS } from '../../config/impacts';
import { PASSABLE_WINDOW_M } from '../../config/track';
import { seededRandom, uniform } from '../random';
import type { RunState } from '../run/state';
import type { Obstacle, Track } from '../track/schema';
import { touches } from './collide';
import { placedBox } from './footprints';

/** What impacts have done so far in a run: plain values, so the step stays pure. */
export interface ImpactState {
  /** One flag per obstacle of the track: each can be hit once (rule 2). */
  readonly hit: readonly boolean[];
  readonly count: number;
  /** Sum of the seeded aim errors, all on one side, applied to the ball's x at the pin deck (rule 2). */
  readonly aimErrorM: number;
}

/** Emitted on each impact, for the scene and the audio (rule 2). */
export interface ImpactEvent {
  readonly obstacleIndex: number;
  readonly kind: Obstacle['kind'];
  readonly speedMps: number;
  readonly runS: number;
}

export function initialImpacts(track: Track): ImpactState {
  return { hit: track.obstacles.map(() => false), count: 0, aimErrorM: 0 };
}

/** Either side is as likely: a fair coin. */
const EVEN_ODDS = 0.5;

/** The side every impact of a run pushes the ball to: −1 or +1, drawn once from the track seed. */
export function aimSideOf(trackSeed: number): -1 | 1 {
  return seededRandom(trackSeed ^ AIM_SIDE_SALT)() < EVEN_ODDS ? -1 : 1;
}

/**
 * The aim error of the impact with obstacle `index`: between IMPACT_AIM_ERROR_MIN_M and
 * IMPACT_AIM_ERROR_M, on the run's side, drawn from the track seed and the obstacle index — same
 * track, same commands, same error (criterion 3), and impacts add up instead of cancelling.
 */
export function aimErrorOf(trackSeed: number, index: number): number {
  return aimSideOf(trackSeed) * uniform(seededRandom((trackSeed ^ AIM_ERROR_SALT) + index), IMPACT_AIM_ERROR_MIN_M, IMPACT_AIM_ERROR_M);
}

/** The adjacent lane a widening gutter pushes the ball to: one with nothing just ahead, else the lower. */
function escapeLane(track: Track, gutter: Obstacle & { lane: LaneIndex }, run: RunState): LaneIndex {
  const neighbours = LANE_INDICES.filter((lane) => Math.abs(lane - gutter.lane) === 1);
  const free = neighbours.filter((lane) =>
    track.obstacles.every((o) => o === gutter || !('lane' in o) || o.lane !== lane || Math.abs(placedBox(o, run.runS).z - run.z) > PASSABLE_WINDOW_M),
  );
  return free[0] ?? neighbours[0] ?? gutter.lane;
}

/** Starts a lane change the ball did not ask for: the gutter's push (rule 3). */
function forceLaneChange(run: RunState, to: LaneIndex): RunState {
  if (run.lane === to) return run;
  const change = { from: run.lane, to, elapsedS: 0 };
  return { ...run, lane: to, x: laneCentreX(run.lane), laneChange: change, lastLaneChange: change };
}

/**
 * Tests the ball against every obstacle not hit yet (rule 1) and applies the cost of each new
 * impact (rules 2 and 3). Called after each step while rolling.
 */
export function applyImpacts(run: RunState, impacts: ImpactState, track: Track): { run: RunState; impacts: ImpactState; events: ImpactEvent[] } {
  let nextRun = run;
  let next = impacts;
  const events: ImpactEvent[] = [];
  track.obstacles.forEach((obstacle, index) => {
    if (next.hit[index] === true || !touches(nextRun, placedBox(obstacle, nextRun.runS))) return;
    events.push({ obstacleIndex: index, kind: obstacle.kind, speedMps: nextRun.speedMps, runS: nextRun.runS });
    next = {
      hit: next.hit.map((h, i) => h || i === index),
      count: next.count + 1,
      aimErrorM: next.aimErrorM + aimErrorOf(track.seed, index),
    };
    nextRun = { ...nextRun, speedMps: nextRun.speedMps * (1 - IMPACT_SPEED_LOSS) };
    if (obstacle.kind === 'widening-gutter') nextRun = forceLaneChange(nextRun, escapeLane(track, obstacle, nextRun));
  });
  return { run: nextRun, impacts: next, events };
}
