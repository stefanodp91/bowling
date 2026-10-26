/**
 * Pin measures and the ten-pin layout (wiki/models/pins.md). Metres. Pure: imports nothing.
 */

const METRES_PER_INCH = 0.0254;

/** Pin height: 15 in (USBC; tolerance ± 1/32 in). */
export const PIN_HEIGHT_M = 15 * METRES_PER_INCH;
/** Pin mass: 1.53 kg, 3 lb 6 oz, inside the USBC range 3 lb 6 oz – 3 lb 10 oz. */
export const PIN_MASS_KG = 1.53;

/**
 * The regulation profile: diameter (in) at height above the base (in), from the USBC pin
 * specification table as reproduced by equipment references (wiki/models/pins.md, References).
 * The top is a dome closing at 15 in.
 */
const PROFILE_INCHES: ReadonlyArray<readonly [number, number]> = [
  [0, 2.031],
  [0.75, 2.828],
  [2.25, 3.906],
  [3.375, 4.51],
  [4.5, 4.766],
  [5.875, 4.546],
  [7.25, 3.574],
  [8.625, 2.475],
  [9.375, 1.965],
  [10, 1.797],
  [10.875, 1.87],
  [11.75, 2.239],
  [12.5, 2.527],
  [13.5, 2.523],
  [14.5, 1.734],
  [15, 0],
];

/** The profile in metres, as (height, radius) pairs, base to top: for the lathe and the collider. */
export const PIN_PROFILE: ReadonlyArray<readonly [number, number]> = PROFILE_INCHES.map(([h, d]) => [h * METRES_PER_INCH, (d / 2) * METRES_PER_INCH]);

/** The belly: 4.766 in ≈ 0.121 m, the widest point. */
export const PIN_MAX_DIAMETER_M = 2 * Math.max(...PIN_PROFILE.map(([, r]) => r));

/** Pin spots are 12 in apart, centre to centre, in an equilateral triangle (USBC). */
export const PIN_SPACING_M = 12 * METRES_PER_INCH;
/** Distance between rows along the lane: 12 in × sin 60°. */
export const PIN_ROW_DEPTH_M = PIN_SPACING_M * Math.sin(Math.PI / 3);
/** A pin spot is 2.25 in across (USBC lane specifications). */
export const PIN_SPOT_DIAMETER_M = 2.25 * METRES_PER_INCH;

/** Standard numbering: row 1 is pin 1, row 2 pins 2–3, row 3 pins 4–6, row 4 pins 7–10. */
export const PIN_ROWS = [[1], [2, 3], [4, 5, 6], [7, 8, 9, 10]] as const;
export type PinNumber = (typeof PIN_ROWS)[number][number];
export const PIN_NUMBERS: readonly PinNumber[] = PIN_ROWS.flat();

export interface PinSpot {
  readonly pin: PinNumber;
  /** Offset from the head pin spot: x to the right as seen from the foul line, z away from it. */
  readonly x: number;
  readonly z: number;
}

/**
 * The ten pin spots relative to the head pin spot. Within a row, pins are numbered left to right as
 * seen from the foul line (wiki/models/pins.md, rule 2).
 */
export function pinSpots(): readonly PinSpot[] {
  return PIN_ROWS.flatMap((row, rowIndex) =>
    row.map((pin: PinNumber, i): PinSpot => ({
      pin,
      x: (i - (row.length - 1) / 2) * PIN_SPACING_M,
      z: rowIndex * PIN_ROW_DEPTH_M,
    })),
  );
}
