/**
 * Pin measures and the ten-pin layout (wiki/models/pins.md). Metres. Pure: imports nothing.
 */

const METRES_PER_INCH = 0.0254;

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
