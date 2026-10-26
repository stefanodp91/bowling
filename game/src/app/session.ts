import type { Skill } from '../config/pilot';
import type { RunState, Command } from '../domain/run/state';
import { initialRunState, runStateAt, step } from '../domain/run/step';
import type { Track } from '../domain/track/schema';
import { SIM_STEP_S } from '../config/run';
import { frameSteps } from './frame-steps';
import type { GameSnapshot } from './snapshot';
import { createStore, type Store } from './store';

/** Who decides each step's command: the autopilot (wiki/pilot/autopilot.md), or «stay». */
export type CommandSource = (state: RunState, track: Track, skill: Skill) => Command;
export const stayOnly: CommandSource = () => 'stay';

export interface SessionOptions {
  readonly track: Track;
  readonly skill: Skill;
  readonly startAtZ?: number;
  readonly speedup?: number;
  readonly commands?: CommandSource;
}

/** The two states a frame renders between, and how far between them (rule 2: rendering interpolates). */
export interface FrameStates {
  readonly previous: RunState;
  readonly current: RunState;
  readonly alpha: number;
}

export interface Session {
  readonly track: Track;
  readonly store: Store<GameSnapshot>;
  /** Advances the simulation by one rendered frame of `frameS` real seconds. */
  frame(frameS: number, timeScale?: number): FrameStates;
  setSkill(skill: Skill): void;
  markReady(): void;
}

function snapshotOf(state: RunState, track: Track, skill: Skill, ready: boolean): GameSnapshot {
  return {
    ready,
    trackId: track.trackId,
    phase: state.phase,
    z: state.z,
    x: state.x,
    speedMps: state.speedMps,
    lane: state.lane,
    impacts: 0,
    skill,
    score: null,
    runS: state.runS,
  };
}

/** One run of one track: the simulation, its fixed-step clock and the snapshot it publishes. */
export function createSession({ track, skill: initialSkill, startAtZ, speedup, commands = stayOnly }: SessionOptions): Session {
  let current = startAtZ === undefined ? initialRunState() : runStateAt(startAtZ);
  let previous = current;
  let carryS = 0;
  let skill = initialSkill;
  let ready = false;
  const store = createStore(snapshotOf(current, track, skill, ready));
  const publish = () => store.set(snapshotOf(current, track, skill, ready));
  return {
    track,
    store,
    frame: (frameS, timeScale = 1) => {
      const plan = frameSteps(carryS, frameS, speedup, timeScale);
      carryS = plan.carryS;
      for (let i = 0; i < plan.steps; i += 1) {
        previous = current;
        current = step(current, commands(current, track, skill), SIM_STEP_S);
      }
      if (plan.steps > 0) publish();
      return { previous, current, alpha: plan.alpha };
    },
    setSkill: (next) => {
      skill = next;
      publish();
    },
    markReady: () => {
      ready = true;
      publish();
    },
  };
}
