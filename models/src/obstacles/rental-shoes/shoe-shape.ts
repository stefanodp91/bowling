/**
 * The shape of one rental shoe as pure functions of t, the fraction of its length from heel (0) to
 * toe (1): half-width of the outline, height of the upper, colour zone, collar opening. Metres.
 */
import { RENTAL_SHOE_HEIGHT_M, RENTAL_SHOE_LENGTH_M, RENTAL_SHOE_WIDTH_M } from '../../measures/obstacles';

/** Sole thickness: a rental shoe's flat slide sole and heel. */
export const SOLE_HEIGHT_M = 0.016;
const HALF_WIDTH_M = RENTAL_SHOE_WIDTH_M / 2;
/** Outline width as a fraction of the widest point: narrow heel, waist, ball of the foot, toe. */
const OUTLINE_PROFILE: ReadonlyArray<readonly [number, number]> = [
  [0, 0.68],
  [0.4, 0.8],
  [0.68, 1],
  [1, 0.9],
];
/** How much of the length the rounded heel and toe take. */
const HEEL_ROUND_T = 0.14;
const TOE_ROUND_T = 0.2;

const smooth = (t: number): number => t * t * (3 - 2 * t);
const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
/** A quarter-circle cap: 0 at the very end, 1 once `round` of the length is reached. */
const cap = (distance: number, round: number): number => Math.sqrt(1 - (1 - clamp01(distance / round)) ** 2);

/** Smooth interpolation through (t, value) points sorted by t. */
function profile(points: ReadonlyArray<readonly [number, number]>, t: number): number {
  for (let i = 1; i < points.length; i += 1) {
    const [t1, v1] = points[i] ?? [1, 0];
    const [t0, v0] = points[i - 1] ?? [0, 0];
    if (t <= t1) return v0 + (v1 - v0) * smooth(clamp01((t - t0) / (t1 - t0)));
  }
  return points[points.length - 1]?.[1] ?? 0;
}

export function outlineHalfWidth(t: number): number {
  return HALF_WIDTH_M * profile(OUTLINE_PROFILE, t) * cap(t, HEEL_ROUND_T) * cap(1 - t, TOE_ROUND_T);
}

/** Upper height above the sole: high heel counter, a dip at the collar, the instep, a low toe. */
const UPPER_PROFILE: ReadonlyArray<readonly [number, number]> = [
  [0, 0.06],
  [0.06, RENTAL_SHOE_HEIGHT_M - SOLE_HEIGHT_M],
  [0.3, 0.08],
  [0.48, 0.078],
  [0.75, 0.05],
  [0.92, 0.035],
  [1, 0.02],
];

export function upperHeight(t: number): number {
  return profile(UPPER_PROFILE, t);
}

/** The three colour zones of a classic rental shoe: heel counter, quarter, vamp and toe. */
export const SHOE_ZONES = ['heel', 'quarter', 'vamp'] as const;
export type ShoeZone = (typeof SHOE_ZONES)[number];
const QUARTER_START_T = 0.3;
const VAMP_START_T = 0.6;

export function zoneAt(t: number): ShoeZone {
  return t < QUARTER_START_T ? 'heel' : t < VAMP_START_T ? 'quarter' : 'vamp';
}

/** The foot opening, an ellipse seen from above: centre t, half-length in t, half-width in metres. */
const COLLAR = { t: 0.25, halfT: 0.17, halfWidthM: 0.032 } as const;

export function isInCollar(t: number, x: number): boolean {
  return ((t - COLLAR.t) / COLLAR.halfT) ** 2 + (x / COLLAR.halfWidthM) ** 2 < 1;
}

/** Laces cross the vamp between these fractions of the length, eyelets this far from the centre. */
export const LACE_RANGE = { fromT: 0.44, toT: 0.66, eyeletXM: 0.02, crossings: 5 } as const;

export const tToZ = (t: number): number => (t - 0.5) * RENTAL_SHOE_LENGTH_M;
