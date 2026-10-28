import type { Skill } from '../config/pilot';
import type { ImpactEvent } from '../domain/impacts/impacts';
import type { RunState, Command } from '../domain/run/state';
import { initialWorld, worldStep, type World } from '../domain/simulation';
import type { Track } from '../domain/track/schema';
import { SIM_STEP_S } from '../config/run';
import type { DeckPort, PhysicsPort } from './deck-port';
import { deckStep } from './deck-step';
import type { GameEvent } from './events';
import { frameSteps } from './frame-steps';
import type { GameSnapshot } from './snapshot';
import { createStore, type Store } from './store';

/** Who decides each step's command: the autopilot (wiki/pilot/autopilot.md), or «stay». */
export type CommandSource = (state: RunState, track: Track, skill: Skill) => Command;
export const stayOnly: CommandSource = () => 'stay';

export interface SessionOptions {
  readonly track: Track;
  /** The run's seed, reported in the snapshot (the command source uses the same). */
  readonly seed?: number;
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

/** Called after every fixed step, with the impacts it produced: physics and sound keep in step. */
export type StepListener = (world: World, events: readonly ImpactEvent[]) => void;

export interface Session {
  readonly track: Track;
  readonly store: Store<GameSnapshot>;
  /** Advances the simulation by one rendered frame of `frameS` real seconds. */
  frame(frameS: number, timeScale?: number, onStep?: StepListener): FrameStates;
  /** The latest state of the whole simulation. */
  world(): World;
  /** Listens to what happens, once per frame, in step order; returns the unsubscribe. */
  onEvents(listener: (events: readonly GameEvent[]) => void): () => void;
  /** The scene's physics and pin deck, stepped with the simulation; returns the detach. */
  attach(ports: { readonly physics: PhysicsPort; readonly deck: DeckPort }): () => void;
  setSkill(skill: Skill): void;
  markReady(): void;
}

function snapshotOf(world: World, track: Track, skill: Skill, ready: boolean, resultSkill: Skill | null, seed: number, handOffSpeedMps: number | null): GameSnapshot {
  const state = world.run;
  return {
    ready,
    trackId: track.trackId,
    phase: state.phase,
    phaseS: state.phaseS,
    z: state.z,
    x: state.x,
    speedMps: state.speedMps,
    lane: state.lane,
    impacts: world.impacts.count,
    skill,
    score: world.deck.pinsDown === null ? null : world.deck.pinsDown.length,
    pinsDown: world.deck.pinsDown,
    resultSkill,
    seed,
    handOffSpeedMps,
    aimErrorM: world.impacts.aimErrorM,
    runS: state.runS,
  };
}

/** One run of one track: the simulation, its fixed-step clock and the snapshot it publishes. */
export function createSession({ track, skill: initialSkill, startAtZ, speedup, commands = stayOnly, seed = track.seed }: SessionOptions): Session {
  let world = initialWorld(track, startAtZ);
  let previous = world.run;
  let carryS = 0;
  let skill = initialSkill;
  let ready = false;
  let resultSkill: Skill | null = null;
  let handOffSpeedMps: number | null = null;
  let ports: { readonly physics: PhysicsPort; readonly deck: DeckPort } | null = null;
  const eventListeners = new Set<(events: readonly GameEvent[]) => void>();
  const snapshot = () => snapshotOf(world, track, skill, ready, resultSkill, seed, handOffSpeedMps);
  const store = createStore(snapshot());
  const publish = () => store.set(snapshot());
  return {
    track,
    store,
    frame: (frameS, timeScale = 1, onStep) => {
      const plan = frameSteps(carryS, frameS, speedup, timeScale);
      carryS = plan.carryS;
      const events: GameEvent[] = [];
      for (let i = 0; i < plan.steps; i += 1) {
        previous = world.run;
        const result = worldStep(world, track, commands(world.run, track, skill), SIM_STEP_S);
        world = result.world;
        const atS = world.run.runS + world.deck.sinceHandOffS;
        for (const e of result.events) events.push({ kind: 'impact', obstacle: e.kind, speedMps: e.speedMps, atS });
        if (ports !== null) {
          ports.physics.step();
          const wasJudged = world.deck.pinsDown !== null;
          world = deckStep(world, ports.deck, SIM_STEP_S, { skill, trackSeed: track.seed });
          for (const speedMps of ports.deck.drainContacts()) events.push({ kind: 'pin-contact', speedMps, atS });
          if (!wasJudged && world.deck.pinsDown !== null) events.push({ kind: 'result', score: world.deck.pinsDown.length, atS });
        }
        if (resultSkill === null && world.deck.handedOff) {
          resultSkill = skill;
          handOffSpeedMps = world.run.speedMps;
        }
        onStep?.(world, result.events);
      }
      if (plan.steps > 0) publish();
      if (events.length > 0) for (const listener of eventListeners) listener(events);
      return { previous, current: world.run, alpha: plan.alpha };
    },
    world: () => world,
    onEvents: (listener) => {
      eventListeners.add(listener);
      return () => eventListeners.delete(listener);
    },
    attach: (next) => {
      ports = next;
      return () => {
        ports = null;
      };
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
