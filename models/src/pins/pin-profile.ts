import { PIN_PROFILE } from '../measures/pins';

/** Points of the smoothed lathe profile, base to top. */
const SAMPLES = 96;
/** The last fraction of the height is a spherical-ish dome, not a straight cone to the tip. */
const DOME_FROM_FRACTION = 0.93;

/** Catmull-Rom through the table: a smooth pin, passing exactly through every regulation point. */
function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
}

/** Radius at height h (metres), interpolated smoothly through PIN_PROFILE. */
export function radiusAt(h: number): number {
  const top = PIN_PROFILE[PIN_PROFILE.length - 1]?.[0] ?? 0;
  const domeStart = top * DOME_FROM_FRACTION;
  if (h >= domeStart) {
    const r0 = radiusAt(domeStart - 1e-9);
    const f = (h - domeStart) / (top - domeStart);
    return r0 * Math.sqrt(Math.max(0, 1 - f * f));
  }
  const i = Math.max(0, PIN_PROFILE.findIndex(([ph]) => ph > h) - 1);
  const at = (k: number): readonly [number, number] => PIN_PROFILE[Math.min(PIN_PROFILE.length - 1, Math.max(0, k))] ?? [0, 0];
  const [h1, r1] = at(i);
  const [h2, r2] = at(i + 1);
  const t = h2 === h1 ? 0 : (h - h1) / (h2 - h1);
  return catmullRom(at(i - 1)[1], r1, r2, at(i + 2)[1], t);
}

/** The lathe path: (radius, height) pairs at evenly spaced heights, from the base centre to the tip. */
export function lathePath(): Array<readonly [number, number]> {
  const top = PIN_PROFILE[PIN_PROFILE.length - 1]?.[0] ?? 0;
  const side = Array.from({ length: SAMPLES + 1 }, (_, i): readonly [number, number] => {
    const h = (top * i) / SAMPLES;
    return [radiusAt(h), h];
  });
  return [[0, 0], ...side];
}
