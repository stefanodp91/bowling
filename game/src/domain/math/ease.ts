/** Smoothstep 3t² − 2t³ on t clamped to [0, 1]: starts and stops with zero slope. */
const SMOOTHSTEP_SQUARE = 3;

export function smoothstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (SMOOTHSTEP_SQUARE - 2 * c);
}
