import { GUTTER_WIDTH_M, SEGMENT_LENGTH_M, TRAVEL_LANE_WIDTH_M, laneCentreX, LANE_INDICES } from '../measures/lane';
import {
  ALLEY_HALF_WIDTH_M,
  ALLEY_INNER_X_M,
  BEAM_DEPTH_M,
  BEAM_DROP_M,
  BEAM_SPACING_M,
  CAPPING_HEIGHT_M,
  CAPPING_WIDTH_M,
  CEILING_HEIGHT_M,
  LIGHT_STRIP_GAP_M,
  LIGHT_STRIP_WIDTH_M,
  MURAL_DISC_RADII_M,
  MURAL_DISC_SPACING_M,
  MURAL_TOP_M,
  NEIGHBOUR_LANE_WIDTH_M,
  NEIGHBOUR_LANES_PER_SIDE,
  NEON_LINE_HEIGHT_M,
  neighbourLaneCentreX,
  WAINSCOT_TOP_M,
} from '../measures/alley';
import { ALLEY_COLOURS, MURAL_DISC_COLOURS, WALL_SHADE } from './alley-palette';
import type { ColourMeshBuilder, Rgb } from './colour-mesh';

/** Everything in one segment, from z = 0 to z = L. */
const L = SEGMENT_LENGTH_M;
const SIDES = [-1, 1] as const;
type Side = (typeof SIDES)[number];
/** Neighbouring gutters sit a little below the boards, like the real channels. */
const GUTTER_DROP_M = 0.02;
/** Details stand this far off the wall or under the ceiling, so they never fight with it. */
const LIFT_M = 0.01;
const DISC_SEGMENTS = 28;
/** The stripe above the wainscot: its height (design). */
const STRIPE_HEIGHT_M = 0.14;

const shaded = (rgb: Rgb, factor: number): Rgb => [rgb[0] * factor, rgb[1] * factor, rgb[2] * factor];

/** A horizontal strip on the floor or ceiling from x0 to x1 at height y, the whole segment long. */
function floorStrip(builder: ColourMeshBuilder, x0: number, x1: number, y: number, colour: Rgb): void {
  builder.quad([[x0, y, 0], [x1, y, 0], [x1, y, L], [x0, y, L]], colour);
}

/** A vertical band of a wall at x, from y0 to y1, darker at its foot. */
function wallBand(builder: ColourMeshBuilder, x: number, y0: number, y1: number, colour: Rgb): void {
  const foot = shaded(colour, WALL_SHADE);
  builder.quad([[x, y0, 0], [x, y1, 0], [x, y1, L], [x, y0, L]], [foot, colour, colour, foot]);
}

/** The cappings, the neighbouring lanes' gutters and the carpet of one side (boards are separate). */
export function addFloor(builder: ColourMeshBuilder, side: Side): void {
  for (let i = 0; i < NEIGHBOUR_LANES_PER_SIDE; i += 1) {
    const capInner = side * (ALLEY_INNER_X_M + i * (CAPPING_WIDTH_M + NEIGHBOUR_LANE_WIDTH_M));
    const capOuter = capInner + side * CAPPING_WIDTH_M;
    floorStrip(builder, capInner, capOuter, CAPPING_HEIGHT_M, ALLEY_COLOURS.capping);
    for (const edge of [capInner, capOuter]) {
      builder.quad([[edge, 0, 0], [edge, CAPPING_HEIGHT_M, 0], [edge, CAPPING_HEIGHT_M, L], [edge, 0, L]], ALLEY_COLOURS.cappingSide);
    }
    const centre = side * neighbourLaneCentreX(i);
    for (const gutterSide of [-1, 1]) {
      const inner = centre + gutterSide * (TRAVEL_LANE_WIDTH_M / 2);
      floorStrip(builder, inner, inner + gutterSide * GUTTER_WIDTH_M, -GUTTER_DROP_M, ALLEY_COLOURS.gutter);
    }
  }
  const walkwayStart = side * (ALLEY_INNER_X_M + NEIGHBOUR_LANES_PER_SIDE * (CAPPING_WIDTH_M + NEIGHBOUR_LANE_WIDTH_M));
  floorStrip(builder, walkwayStart, side * ALLEY_HALF_WIDTH_M, 0, ALLEY_COLOURS.carpet);
}

/** One side wall: wainscot, stripe, mural with its discs, neon line, top band. */
export function addWall(builder: ColourMeshBuilder, side: Side): void {
  const x = side * ALLEY_HALF_WIDTH_M;
  const inward = x - side * LIFT_M;
  wallBand(builder, x, 0, WAINSCOT_TOP_M, ALLEY_COLOURS.wainscot);
  wallBand(builder, x, WAINSCOT_TOP_M, MURAL_TOP_M, ALLEY_COLOURS.mural);
  wallBand(builder, x, MURAL_TOP_M, CEILING_HEIGHT_M, ALLEY_COLOURS.topBand);
  wallBand(builder, inward, WAINSCOT_TOP_M, WAINSCOT_TOP_M + STRIPE_HEIGHT_M, ALLEY_COLOURS.stripe);
  builder.quad(
    [[inward, MURAL_TOP_M - NEON_LINE_HEIGHT_M, 0], [inward, MURAL_TOP_M, 0], [inward, MURAL_TOP_M, L], [inward, MURAL_TOP_M - NEON_LINE_HEIGHT_M, L]],
    ALLEY_COLOURS.neon,
  );
  const discY = (WAINSCOT_TOP_M + STRIPE_HEIGHT_M + MURAL_TOP_M - NEON_LINE_HEIGHT_M) / 2;
  const discs = Math.round(L / MURAL_DISC_SPACING_M);
  for (let k = 0; k < discs; k += 1) {
    const radius = MURAL_DISC_RADII_M[k % MURAL_DISC_RADII_M.length] ?? MURAL_DISC_RADII_M[0];
    const colour = MURAL_DISC_COLOURS[k % MURAL_DISC_COLOURS.length] ?? ALLEY_COLOURS.stripe;
    builder.discAcrossX([inward, discY, (k + 0.5) * MURAL_DISC_SPACING_M], radius, DISC_SEGMENTS, colour);
  }
}

/** The x of every lane's centre, the three travel lanes and the neighbouring ones on both sides. */
function allLaneCentres(): number[] {
  const neighbours = SIDES.flatMap((side) => Array.from({ length: NEIGHBOUR_LANES_PER_SIDE }, (_, i) => side * neighbourLaneCentreX(i)));
  return [...LANE_INDICES.map(laneCentreX), ...neighbours];
}

/** The ceiling, its cross beams and a light strip above every lane between two beams. */
export function addCeiling(builder: ColourMeshBuilder): void {
  floorStrip(builder, -ALLEY_HALF_WIDTH_M, ALLEY_HALF_WIDTH_M, CEILING_HEIGHT_M, ALLEY_COLOURS.ceiling);
  const beamBottom = CEILING_HEIGHT_M - BEAM_DROP_M;
  const beams = Math.round(L / BEAM_SPACING_M);
  for (let k = 0; k < beams; k += 1) {
    const z = k * BEAM_SPACING_M;
    const [front, back] = [z - BEAM_DEPTH_M / 2, z + BEAM_DEPTH_M / 2];
    const [left, right] = [-ALLEY_HALF_WIDTH_M, ALLEY_HALF_WIDTH_M];
    builder.quad([[left, beamBottom, front], [right, beamBottom, front], [right, beamBottom, back], [left, beamBottom, back]], ALLEY_COLOURS.beam);
    for (const face of [front, back]) {
      builder.quad([[left, beamBottom, face], [right, beamBottom, face], [right, CEILING_HEIGHT_M, face], [left, CEILING_HEIGHT_M, face]], ALLEY_COLOURS.beam);
    }
    const [stripStart, stripEnd] = [back + LIGHT_STRIP_GAP_M, z + BEAM_SPACING_M - BEAM_DEPTH_M / 2 - LIGHT_STRIP_GAP_M];
    const y = CEILING_HEIGHT_M - LIFT_M;
    for (const x of allLaneCentres()) {
      const [x0, x1] = [x - LIGHT_STRIP_WIDTH_M / 2, x + LIGHT_STRIP_WIDTH_M / 2];
      builder.quad([[x0, y, stripStart], [x1, y, stripStart], [x1, y, stripEnd], [x0, y, stripEnd]], ALLEY_COLOURS.light);
    }
  }
}
