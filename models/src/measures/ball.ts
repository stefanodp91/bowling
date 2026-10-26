/**
 * Bowling ball measures (wiki/models/ball.md, rule 1). Metres and kilograms. Pure: imports nothing.
 */

/** 0.218 m: the USBC maximum diameter, 8.595 in = 0.2183 m, rounded to the millimetre. */
export const BALL_DIAMETER_M = 0.218;
export const BALL_RADIUS_M = BALL_DIAMETER_M / 2;

/** 7.26 kg: 16 lb, the USBC maximum weight (1 lb = 0.45359 kg). */
export const BALL_MASS_KG = 7.26;

/** The weight printed on the house ball, in pounds, matching BALL_MASS_KG. */
export const BALL_WEIGHT_LB = 16;

/** One gripping hole: where it is on the ball, how wide and how deep. */
export interface FingerHole {
  readonly name: 'thumb' | 'middle' | 'ring';
  /** Position of the hole centre, as angles from the ball's local +y pole (radians). */
  readonly polarRad: number;
  readonly azimuthRad: number;
  readonly diameterM: number;
  readonly depthM: number;
}

/**
 * Conventional grip, from typical drilling sheets: thumb hole ≈ 1 in (25.4 mm), finger holes
 * ≈ 3/4 in (19 mm); span ≈ 4.3 in (110 mm) from thumb centre to finger centres along the surface;
 * bridge between the fingers ≈ 1/4 in (6 mm), so finger centres ≈ 25 mm apart. Depths are what the
 * eye can see, not the drilled depth (a recess only has to read as a hole).
 */
const THUMB_DIAMETER_M = 0.0254;
const FINGER_DIAMETER_M = 0.019;
const SPAN_M = 0.11;
const FINGER_CENTRES_M = 0.025;
const THUMB_DEPTH_M = 0.03;
const FINGER_DEPTH_M = 0.024;

/** Half the span, as an angle from the pole: the grip is centred on +y. */
const HALF_SPAN_RAD = SPAN_M / 2 / BALL_RADIUS_M;
/** Half the finger spacing, as an azimuth on the circle the finger centres sit on. */
const FINGER_HALF_AZIMUTH_RAD = FINGER_CENTRES_M / 2 / (BALL_RADIUS_M * Math.sin(HALF_SPAN_RAD));

export const FINGER_HOLES: readonly FingerHole[] = [
  { name: 'thumb', polarRad: HALF_SPAN_RAD, azimuthRad: Math.PI, diameterM: THUMB_DIAMETER_M, depthM: THUMB_DEPTH_M },
  { name: 'middle', polarRad: HALF_SPAN_RAD, azimuthRad: -FINGER_HALF_AZIMUTH_RAD, diameterM: FINGER_DIAMETER_M, depthM: FINGER_DEPTH_M },
  { name: 'ring', polarRad: HALF_SPAN_RAD, azimuthRad: FINGER_HALF_AZIMUTH_RAD, diameterM: FINGER_DIAMETER_M, depthM: FINGER_DEPTH_M },
];

/** Unit direction of a hole centre in the ball's local frame (azimuth measured from +z towards +x). */
export function holeDirection(hole: FingerHole): readonly [number, number, number] {
  const sinPolar = Math.sin(hole.polarRad);
  return [sinPolar * Math.sin(hole.azimuthRad), Math.cos(hole.polarRad), sinPolar * Math.cos(hole.azimuthRad)];
}
