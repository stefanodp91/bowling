/**
 * The alley around the lane (wiki/models/lane.md, rule 6). Metres. Pure: imports only other
 * measures. x across the room (left negative), y up, z along the lanes; the room is symmetric.
 */
import { GUTTER_WIDTH_M, PLAYING_SURFACE_WIDTH_M, TRAVEL_LANE_WIDTH_M } from './lane';
import { PROP_SCALE } from './scale';

/** Neighbouring lanes on each side of the playing surface (rule 6). */
export const NEIGHBOUR_LANES_PER_SIDE = 2;
/** One neighbouring lane: a regulation lane between its two gutters. */
export const NEIGHBOUR_LANE_WIDTH_M = TRAVEL_LANE_WIDTH_M + 2 * GUTTER_WIDTH_M;
/**
 * The capping, the raised divider before each neighbouring lane: ≈ 0.3 m wide, a few centimetres
 * high (design: the ball-return covers between real lane pairs are of this size).
 */
export const CAPPING_WIDTH_M = 0.3;
export const CAPPING_HEIGHT_M = 0.06;
/** The carpeted walkway between the last neighbouring lane and the side wall (design). */
export const WALKWAY_WIDTH_M = 1.2;

/** x where the first capping starts: the outer edge of the playing surface's gutter. */
export const ALLEY_INNER_X_M = PLAYING_SURFACE_WIDTH_M / 2;
/** x of the centre of neighbouring lane `index` (0 nearest the playing surface) on the right side. */
export function neighbourLaneCentreX(index: number): number {
  return ALLEY_INNER_X_M + (index + 1) * CAPPING_WIDTH_M + (index + 0.5) * NEIGHBOUR_LANE_WIDTH_M;
}
/** Half the room's width: from the centre line to the side wall. */
export const ALLEY_HALF_WIDTH_M = ALLEY_INNER_X_M + NEIGHBOUR_LANES_PER_SIDE * (CAPPING_WIDTH_M + NEIGHBOUR_LANE_WIDTH_M) + WALKWAY_WIDTH_M;

/** The ceiling: 4.5 m above the lanes (design: a low commercial ceiling, close enough to be seen). */
export const CEILING_HEIGHT_M = 4.5;
/** Wall bands, from the floor: a dark wainscot, then the mural, then a top band to the ceiling. */
export const WAINSCOT_TOP_M = 1.1;
export const MURAL_TOP_M = 3.6;

/** Cross beams under the ceiling: one every 5 m, 0.35 m deep along z and 0.35 m tall (design). */
export const BEAM_SPACING_M = 5;
export const BEAM_DEPTH_M = 0.35;
export const BEAM_DROP_M = 0.35;
/** A light strip hangs above every lane between two beams, this wide, with this gap to each beam. */
export const LIGHT_STRIP_WIDTH_M = 0.2;
export const LIGHT_STRIP_GAP_M = 0.6;
/** A thin neon line runs along each wall at the top of the mural (design: the alley's cheerful glow). */
export const NEON_LINE_HEIGHT_M = 0.08;

/** The mural: one disc every 2.5 m along each wall, radii cycling through these values (design). */
export const MURAL_DISC_SPACING_M = 2.5;
export const MURAL_DISC_RADII_M = [0.75, 0.5, 0.9, 0.6] as const;

/**
 * The end of the room (rule 6): over the dark pinsetter openings hangs a masking unit, the painted
 * panel real alleys put above the pins. Its bottom edge is 0.7 m above the deck at regulation size
 * (design), × PROP_SCALE like the pins it clears; it runs to the ceiling, its top band as deep as
 * the side walls' (from MURAL_TOP_M up).
 */
export const MASKING_UNIT_BOTTOM_M = 0.7 * PROP_SCALE;
