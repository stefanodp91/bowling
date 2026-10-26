import type { CommandSource } from '../app/session';
import { BLIND_INTERVAL_S, BLIND_SALT } from '../config/pilot';
import { COMMANDS } from '../domain/run/state';
import { seededRandom, uniform } from '../domain/random';

/**
 * The «taps without looking» baseline (wiki/pilot/headless-runs.md, rule 2): seeded random commands
 * at seeded random intervals, ignoring the track. Same seed, same taps.
 */
export function createBlindDriver(seed: number): CommandSource {
  const random = seededRandom(seed ^ BLIND_SALT);
  let nextTapS = uniform(random, BLIND_INTERVAL_S.min, BLIND_INTERVAL_S.max);
  return (run) => {
    if (run.phase !== 'rolling' || run.runS < nextTapS) return 'stay';
    nextTapS = run.runS + uniform(random, BLIND_INTERVAL_S.min, BLIND_INTERVAL_S.max);
    return COMMANDS[Math.floor(random() * COMMANDS.length)] ?? 'stay';
  };
}
