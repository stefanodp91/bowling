/**
 * Lane measures (wiki/models/lane.md, rule 1). Metres. Pure: imports only other measures.
 * x across the lane (left negative), z along it from the foul line (z = 0) to the head pin.
 * The lane is at regulation size; the pin deck is sized for the pins, so it grows with them.
 */
import { PIN_ROW_DEPTH_M } from './pins';
import { PROP_SCALE } from './scale';

const METRES_PER_INCH = 0.0254;
const METRES_PER_FOOT = 0.3048;

/** One travel lane: 41.5 in, the regulation lane width (USBC; Wikipedia «Tenpin bowling»). */
export const TRAVEL_LANE_WIDTH_M = 41.5 * METRES_PER_INCH;
/** Boards per travel lane: 39 (same source). */
export const BOARDS_PER_LANE = 39;
export const BOARD_WIDTH_M = TRAVEL_LANE_WIDTH_M / BOARDS_PER_LANE;
/** Three travel lanes side by side (design: wiki/models/lane.md). */
export const TRAVEL_LANES = 3;
export const LANE_INDICES = [0, 1, 2] as const;
export type LaneIndex = (typeof LANE_INDICES)[number];
/** The centre lane is index 1. */
export const CENTRE_LANE: LaneIndex = 1;

/** x of a travel lane's centre: −1.054, 0, +1.054 m. */
export function laneCentreX(lane: LaneIndex): number {
  return (lane - CENTRE_LANE) * TRAVEL_LANE_WIDTH_M;
}

/** Width of the boards of the three lanes together. */
export const BOARDS_SURFACE_WIDTH_M = TRAVEL_LANES * TRAVEL_LANE_WIDTH_M;
/** Gutters: 9.25 in wide, 1.875 in deep (dimensions.com «Bowling Lane»). Outer edges only. */
export const GUTTER_WIDTH_M = 9.25 * METRES_PER_INCH;
export const GUTTER_DEPTH_M = 1.875 * METRES_PER_INCH;
/** Whole playing surface: three travel lanes and the two outer gutters. */
export const PLAYING_SURFACE_WIDTH_M = BOARDS_SURFACE_WIDTH_M + 2 * GUTTER_WIDTH_M;

/** The run: 300 m from the foul line to the head pin (a human's decision, wiki/models/lane.md). */
export const LANE_LENGTH_M = 300;
/** The lane is built in 20 m segments that the scene instances and recycles. */
export const SEGMENT_LENGTH_M = 20;

/** A regulation lane: 60 ft from the foul line to the head pin centre (USBC). */
export const REGULATION_FOUL_TO_HEAD_PIN_M = 60 * METRES_PER_FOOT;
/** Targeting arrows ≈ 15 ft past the foul line, dots ≈ 7 ft (Wikipedia; lane diagrams). */
export const ARROWS_FROM_FOUL_LINE_M = 15 * METRES_PER_FOOT;
export const DOTS_FROM_FOUL_LINE_M = 7 * METRES_PER_FOOT;
/** Arrows sit on every fifth board, counted from the edge; dots on boards 3, 5, 8, 11, 14 per side. */
export const ARROW_BOARDS = [5, 10, 15, 20, 25, 30, 35] as const;
export const DOT_BOARDS = [3, 5, 8, 11, 14, 26, 29, 32, 35, 37] as const;
/** The foul line is 3/8 in wide (USBC); markings are this thin above the boards. */
export const FOUL_LINE_WIDTH_M = 0.375 * METRES_PER_INCH;

/**
 * Markings repeat near the end: a second, regulation-length lane ends at the head pin, so its
 * foul line falls this far into the last segment (wiki/models/lane.md, rule 2).
 */
export const FINAL_FOUL_LINE_Z_M = LANE_LENGTH_M - REGULATION_FOUL_TO_HEAD_PIN_M;

/** x of the centre of board `board` (1-based, counted from the lane's left edge) in lane `lane`. */
export function boardCentreX(lane: LaneIndex, board: number): number {
  return laneCentreX(lane) - TRAVEL_LANE_WIDTH_M / 2 + (board - 0.5) * BOARD_WIDTH_M;
}

/**
 * The pin deck's end and the pit behind it (wiki/models/lane.md, rule 3), relative to the head pin
 * spot along z: the deck starts 0.3 m before the head pin and ends 0.3 m past the back row
 * (design margins); the pit is 0.8 m deep and 0.25 m below the lane; the masking wall stands at
 * its back, 1.6 m tall. Sized for regulation pins, so × PROP_SCALE like them. Shared by the deck
 * model and the physics colliders.
 */
export const PIN_DECK_FRONT_M = 0.3 * PROP_SCALE;
export const PIN_DECK_BACK_MARGIN_M = 0.3 * PROP_SCALE;
const PIN_ROWS_DEPTH_M = 3 * PIN_ROW_DEPTH_M;
export const PIN_DECK_END_M = PIN_ROWS_DEPTH_M + PIN_DECK_BACK_MARGIN_M;
export const PIT_DEPTH_M = 0.8 * PROP_SCALE;
export const PIT_DROP_M = 0.25 * PROP_SCALE;
export const MASKING_WALL_HEIGHT_M = 1.6 * PROP_SCALE;
