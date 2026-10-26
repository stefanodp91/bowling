/**
 * Obstacle measures and footprints (wiki/models/obstacles/*). Metres. Pure: imports only measures.
 * A footprint is a box on the obstacle's travel-lane centre, its centre at the track z plus
 * centreZM, used by the domain's collision test: |dx| ≤ halfWidthM, |dz − centreZM| ≤ halfDepthM,
 * height from the lane surface.
 */

export interface Footprint {
  readonly halfWidthM: number;
  readonly halfDepthM: number;
  readonly heightM: number;
  /** From the obstacle's z to the centre of the box: 0, except for obstacles that start at z. */
  readonly centreZM: number;
}

import { BALL_DIAMETER_M, BALL_RADIUS_M } from './ball';
import { PLAYING_SURFACE_WIDTH_M, TRAVEL_LANE_WIDTH_M } from './lane';

/** Box containing every rotated rectangle (centre x/z, half extents, yaw) of a group. */
function boxAround(parts: ReadonlyArray<{ x: number; z: number; halfWidth: number; halfLength: number; yawRad: number }>): Omit<Footprint, 'heightM' | 'centreZM'> {
  let halfWidthM = 0;
  let halfDepthM = 0;
  for (const p of parts) {
    const c = Math.abs(Math.cos(p.yawRad));
    const s = Math.abs(Math.sin(p.yawRad));
    halfWidthM = Math.max(halfWidthM, Math.abs(p.x) + p.halfWidth * c + p.halfLength * s);
    halfDepthM = Math.max(halfDepthM, Math.abs(p.z) + p.halfWidth * s + p.halfLength * c);
  }
  return { halfWidthM, halfDepthM };
}

// --- Rental shoes (wiki/models/obstacles/rental-shoes.md) ---

/** A men's US 10 rental shoe: ≈ 0.30 m long (foot ≈ 28 cm plus the shoe), ≈ 0.11 m wide. */
export const RENTAL_SHOE_LENGTH_M = 0.3;
export const RENTAL_SHOE_WIDTH_M = 0.11;
/** Heel counter top above the ground, sole included (≈ 0.12 m, rule 2). */
export const RENTAL_SHOE_HEIGHT_M = 0.12;
/**
 * The pair, side by side, toes towards the approaching ball (yaw ≈ π), each slightly turned
 * (design: «as if kicked off»). The left shoe of the wearer is on the ball's right once turned.
 */
export const RENTAL_SHOE_PLACEMENTS = [
  { side: 'left', x: 0.075, z: 0.02, yawRad: Math.PI + 0.14 },
  { side: 'right', x: -0.075, z: -0.02, yawRad: Math.PI - 0.1 },
] as const;

export const RENTAL_SHOES_FOOTPRINT: Footprint = {
  ...boxAround(RENTAL_SHOE_PLACEMENTS.map((p) => ({ x: p.x, z: p.z, halfWidth: RENTAL_SHOE_WIDTH_M / 2, halfLength: RENTAL_SHOE_LENGTH_M / 2, yawRad: p.yawRad }))),
  heightM: RENTAL_SHOE_HEIGHT_M,
  centreZM: 0,
};

// --- Returning ball (wiki/models/obstacles/returning-ball.md) ---

/** A house ball: the regulation ball's diameter, centred in its lane at its current z. */
export const RETURNING_BALL_FOOTPRINT: Footprint = {
  halfWidthM: BALL_RADIUS_M,
  halfDepthM: BALL_RADIUS_M,
  heightM: BALL_DIAMETER_M,
  centreZM: 0,
};

// --- Sweep bar (wiki/models/obstacles/sweep-bar.md) ---

/** Top edge of the board above the lane: 0.30 m, below the jump apex (rule 2). */
export const SWEEP_BAR_HEIGHT_M = 0.3;
/** Board thickness (design: a pressed steel board, ≈ 3 cm), and its folded top lip, the deepest part. */
export const SWEEP_BOARD_THICKNESS_M = 0.03;
export const SWEEP_LIP_DEPTH_M = 0.05;
/** The board overhangs the gutters by this much on each side, so it spans the whole surface. */
export const SWEEP_OVERHANG_M = 0.06;
/** Half the swing along z, at the board's bottom edge (design: a gentle sway, readable but never wide). */
export const SWEEP_SWING_AMPLITUDE_M = 0.12;
/** The arms hang the board from pivots this high above the lane (design: inside the machine). */
export const SWEEP_PIVOT_HEIGHT_M = 1.4;

/** The pendulum's largest angle: the bottom edge, farthest from the pivot, moves ± the amplitude. */
export const SWEEP_SWING_ANGLE_RAD = Math.asin(SWEEP_SWING_AMPLITUDE_M / SWEEP_PIVOT_HEIGHT_M);

/**
 * The footprint contains the whole swing: depth = lip + amplitude; height = the lip's top corner
 * at the largest angle, which rises a few millimetres above SWEEP_BAR_HEIGHT_M.
 */
export const SWEEP_BAR_FOOTPRINT: Footprint = {
  halfWidthM: PLAYING_SURFACE_WIDTH_M / 2 + SWEEP_OVERHANG_M,
  halfDepthM: SWEEP_LIP_DEPTH_M / 2 + SWEEP_SWING_AMPLITUDE_M,
  heightM:
    SWEEP_PIVOT_HEIGHT_M -
    (SWEEP_PIVOT_HEIGHT_M - SWEEP_BAR_HEIGHT_M) * Math.cos(SWEEP_SWING_ANGLE_RAD) +
    (SWEEP_LIP_DEPTH_M / 2) * Math.sin(SWEEP_SWING_ANGLE_RAD),
  centreZM: 0,
};

// --- Widening gutter (wiki/models/obstacles/widening-gutter.md) ---

/** Length of the tapered ramp at each end, where the channel opens and closes (rule 1). */
export const GUTTER_RAMP_M = 2;

/**
 * The widening gutter's footprint: its travel lane over [z, z + lengthM] (rule 3). It is terrain:
 * height 0, so no jump clears it.
 */
export function wideningGutterFootprint(lengthM: number): Footprint {
  return { halfWidthM: TRAVEL_LANE_WIDTH_M / 2, halfDepthM: lengthM / 2, heightM: 0, centreZM: lengthM / 2 };
}
