/**
 * Obstacle measures and footprints (wiki/models/obstacles/*). Metres, at twice life size
 * (PROP_SCALE, wiki/models/conventions.md) except across the lane. Pure: imports only measures.
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
import { PROP_SCALE } from './scale';

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
export const RENTAL_SHOE_LENGTH_M = 0.3 * PROP_SCALE;
export const RENTAL_SHOE_WIDTH_M = 0.11 * PROP_SCALE;
/** Heel counter top above the ground, sole included (≈ 0.12 m, rule 2). */
export const RENTAL_SHOE_HEIGHT_M = 0.12 * PROP_SCALE;
/**
 * The pair, side by side, toes towards the approaching ball (yaw ≈ π), each slightly turned
 * (design: «as if kicked off»). The left shoe of the wearer is on the ball's right once turned.
 */
export const RENTAL_SHOE_PLACEMENTS = [
  { side: 'left', x: 0.075 * PROP_SCALE, z: 0.02 * PROP_SCALE, yawRad: Math.PI + 0.14 },
  { side: 'right', x: -0.075 * PROP_SCALE, z: -0.02 * PROP_SCALE, yawRad: Math.PI - 0.1 },
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

// --- Soda cans (wiki/models/obstacles/soda-cans.md) ---

/**
 * A 12 fl oz drink can: 122 mm tall, 66 mm across (the standard 211 can body), × PROP_SCALE. No
 * brand: plain red cans (open-source hygiene, AGENTS.md rule 6).
 */
export const SODA_CAN_HEIGHT_M = 0.122 * PROP_SCALE;
export const SODA_CAN_DIAMETER_M = 0.066 * PROP_SCALE;
/** Cans across the whole playing surface, this far apart (design: gaps narrower than the ball). */
export const SODA_CAN_SPACING_M = 0.15 * PROP_SCALE;
/** As many cans as fit across the surface at that spacing. */
export const SODA_CAN_COUNT = Math.floor(PLAYING_SURFACE_WIDTH_M / SODA_CAN_SPACING_M);
/** Largest seeded offset of each can from its place in the row, along x and z (design: spilled, not lined up). */
export const SODA_CAN_JITTER_M = 0.03 * PROP_SCALE;
/** Share of the cans lying on their side, rolled any way (design). */
export const SODA_CAN_LYING_SHARE = 0.35;

/**
 * The row's footprint: the whole surface wide, deep enough for a lying can turned any way at its
 * largest offset; height = a standing can, below the jump apex.
 */
export const SODA_CANS_FOOTPRINT: Footprint = {
  halfWidthM: PLAYING_SURFACE_WIDTH_M / 2,
  halfDepthM: SODA_CAN_JITTER_M + SODA_CAN_HEIGHT_M / 2,
  heightM: SODA_CAN_HEIGHT_M,
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

// --- Wet floor sign (wiki/models/obstacles/wet-floor-sign.md) ---

/**
 * A folding A-frame «wet floor» sign: 0.62 m tall, panels 0.30 m wide, its two feet 0.30 m apart
 * when open (common janitorial signs, ≈ 24–25 in tall), × PROP_SCALE: taller than the jump apex.
 */
export const WET_FLOOR_SIGN_HEIGHT_M = 0.62 * PROP_SCALE;
export const WET_FLOOR_SIGN_WIDTH_M = 0.3 * PROP_SCALE;
export const WET_FLOOR_SIGN_SPREAD_M = 0.3 * PROP_SCALE;

/** The open sign's box; one panel faces the approaching ball. */
export const WET_FLOOR_SIGN_FOOTPRINT: Footprint = {
  halfWidthM: WET_FLOOR_SIGN_WIDTH_M / 2,
  halfDepthM: WET_FLOOR_SIGN_SPREAD_M / 2,
  heightM: WET_FLOOR_SIGN_HEIGHT_M,
  centreZM: 0,
};
