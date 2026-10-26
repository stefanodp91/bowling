import type { CommandSource } from '../app/session';
import { decide, emptyMemory, type PilotMemory } from './autopilot';

/** The autopilot as the session's command source: it carries its own memory from step to step. */
export function createAutopilot(seed: number): CommandSource {
  let memory: PilotMemory = emptyMemory;
  return (run, track, skill) => {
    const result = decide({ track, run, skill, seed, memory });
    memory = result.memory;
    return result.command;
  };
}
