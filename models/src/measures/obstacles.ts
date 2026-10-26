/**
 * Obstacle measures and footprints (wiki/models/obstacles/*). Metres. Pure: imports only measures.
 * A footprint is a box centred on the obstacle's position (travel-lane centre, track z), used by
 * the domain's collision test: |dx| ≤ halfWidthM, |dz| ≤ halfDepthM, height from the lane surface.
 */

export interface Footprint {
  readonly halfWidthM: number;
  readonly halfDepthM: number;
  readonly heightM: number;
}

import { BALL_DIAMETER_M, BALL_RADIUS_M } from './ball';

/** Box containing every rotated rectangle (centre x/z, half extents, yaw) of a group. */
function boxAround(parts: ReadonlyArray<{ x: number; z: number; halfWidth: number; halfLength: number; yawRad: number }>): Omit<Footprint, 'heightM'> {
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
};

// --- Returning ball (wiki/models/obstacles/returning-ball.md) ---

/** A house ball: the regulation ball's diameter, centred in its lane at its current z. */
export const RETURNING_BALL_FOOTPRINT: Footprint = {
  halfWidthM: BALL_RADIUS_M,
  halfDepthM: BALL_RADIUS_M,
  heightM: BALL_DIAMETER_M,
};
