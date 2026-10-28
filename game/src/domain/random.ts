/**
 * The domain's only source of randomness: a seeded generator injected where it is needed
 * (AGENTS.md, «Determinism»). Same seed, same sequence.
 */
export type RandomSource = () => number;

/** mulberry32: 32-bit state, uniform in [0, 1). Constants are the algorithm's own. */
const INCREMENT = 0x6d2b79f5;
const SHIFT_A = 15;
const SHIFT_B = 7;
const SHIFT_C = 14;
const MIX = 61;
const UINT32_RANGE = 4294967296;

export function seededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state + INCREMENT) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> SHIFT_A), t | 1);
    t ^= t + Math.imul(t ^ (t >>> SHIFT_B), t | MIX);
    return ((t ^ (t >>> SHIFT_C)) >>> 0) / UINT32_RANGE;
  };
}

/** A uniform number in [min, max). */
export function uniform(random: RandomSource, min: number, max: number): number {
  return min + (max - min) * random();
}
