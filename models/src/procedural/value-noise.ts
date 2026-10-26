import type { RandomSource } from './seeded-random';

/** Size of the lattice permutation table: a power of two, so wrapping is a bit mask. */
const TABLE_SIZE = 256;
const TABLE_MASK = TABLE_SIZE - 1;
/** Octaves of fractal noise: enough detail for a ball-sized texture. */
const DEFAULT_OCTAVES = 4;
/** Each octave doubles the frequency and halves the amplitude (classic fBm). */
const LACUNARITY = 2;
const GAIN = 0.5;

const smooth = (t: number): number => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export interface Noise3 {
  /** Smooth value noise in [0, 1] at a point of space. */
  value(x: number, y: number, z: number): number;
  /** Fractal sum of `octaves` noise layers, in [0, 1]. */
  fbm(x: number, y: number, z: number, octaves?: number): number;
}

/** 3D value noise on an integer lattice, seeded: the same source gives the same field. */
export function createNoise3(random: RandomSource): Noise3 {
  const values = Float32Array.from({ length: TABLE_SIZE }, () => random());
  const perm = Uint8Array.from({ length: TABLE_SIZE }, (_, i) => i);
  for (let i = TABLE_MASK; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const swap = perm[i] ?? 0;
    perm[i] = perm[j] ?? 0;
    perm[j] = swap;
  }
  const lattice = (x: number, y: number, z: number): number =>
    values[perm[((perm[((perm[x & TABLE_MASK] ?? 0) + y) & TABLE_MASK] ?? 0) + z) & TABLE_MASK] ?? 0] ?? 0;

  const value = (x: number, y: number, z: number): number => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const zi = Math.floor(z);
    const tx = smooth(x - xi);
    const ty = smooth(y - yi);
    const tz = smooth(z - zi);
    const corner = (dx: number, dy: number, dz: number): number => lattice(xi + dx, yi + dy, zi + dz);
    const x00 = lerp(corner(0, 0, 0), corner(1, 0, 0), tx);
    const x10 = lerp(corner(0, 1, 0), corner(1, 1, 0), tx);
    const x01 = lerp(corner(0, 0, 1), corner(1, 0, 1), tx);
    const x11 = lerp(corner(0, 1, 1), corner(1, 1, 1), tx);
    return lerp(lerp(x00, x10, ty), lerp(x01, x11, ty), tz);
  };

  const fbm = (x: number, y: number, z: number, octaves = DEFAULT_OCTAVES): number => {
    let sum = 0;
    let amplitude = 1;
    let frequency = 1;
    let total = 0;
    for (let octave = 0; octave < octaves; octave += 1) {
      sum += value(x * frequency, y * frequency, z * frequency) * amplitude;
      total += amplitude;
      amplitude *= GAIN;
      frequency *= LACUNARITY;
    }
    return sum / total;
  };

  return { value, fbm };
}
