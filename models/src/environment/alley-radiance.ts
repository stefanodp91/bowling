/**
 * The light that surrounds every model: a dim bowling alley whose ceiling carries rows of light
 * strips running along the lane (+z), a dark masking far wall and a dark floor. A pure function of
 * a direction, so the environment is generated from numbers (wiki/models/conventions.md).
 */

/** Linear RGB in [0, 1]. */
export type Rgb = readonly [number, number, number];

/** Base glow of the ceiling between strips, warm (design choice from alley photos). */
const CEILING_RGB: Rgb = [0.16, 0.13, 0.11];
/** The light strips: near white, slightly warm. */
const STRIP_RGB: Rgb = [1, 0.96, 0.88];
/** Walls at the horizon, a dark blue-violet like the masking units of an alley. */
const HORIZON_RGB: Rgb = [0.07, 0.07, 0.1];
/** Floor, almost black. */
const FLOOR_RGB: Rgb = [0.03, 0.025, 0.02];

/** Strips repeat across x every this many units of the ceiling plane (tan of the angle). */
const STRIP_PERIOD = 1.6;
/** Fraction of each period that is lit. */
const STRIP_DUTY = 0.12;
/** Below this elevation (y of the unit direction) the ceiling fades into the horizon. */
const CEILING_FADE_Y = 0.25;

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

/** Radiance seen looking along the unit direction (x, y, z). */
export function alleyRadiance(x: number, y: number, z: number): Rgb {
  if (y <= 0) return mix(HORIZON_RGB, FLOOR_RGB, clamp01(-y / CEILING_FADE_Y));
  const planeX = x / y;
  const phase = planeX / STRIP_PERIOD - Math.floor(planeX / STRIP_PERIOD);
  const isStrip = phase < STRIP_DUTY && Math.abs(z / y) < 1 / STRIP_DUTY;
  const ceiling = isStrip ? STRIP_RGB : CEILING_RGB;
  return mix(HORIZON_RGB, ceiling, clamp01(y / CEILING_FADE_Y));
}
