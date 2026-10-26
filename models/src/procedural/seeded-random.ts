/**
 * A seeded pseudo-random source for procedural textures and placements: mulberry32, a 32-bit
 * generator with good spread for this use (not cryptographic). Same seed, same sequence.
 */
export type RandomSource = () => number;

const MULBERRY_INCREMENT = 0x6d2b79f5;
const SHIFT_A = 15;
const SHIFT_B = 7;
const SHIFT_C = 14;
const MIX_A = 61;
const UINT32_RANGE = 4294967296;

export function seededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state + MULBERRY_INCREMENT) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> SHIFT_A), t | 1);
    t ^= t + Math.imul(t ^ (t >>> SHIFT_B), t | MIX_A);
    return ((t ^ (t >>> SHIFT_C)) >>> 0) / UINT32_RANGE;
  };
}
