import { MURAL_DISC_RADII_M, MURAL_DISC_SPACING_M } from '../measures/alley';
import { SEGMENT_LENGTH_M } from '../measures/lane';
import { seededRandom } from '../procedural/seeded-random';
import type { AlleyPalette } from './alley-palette';
import type { ColourMeshBuilder, Rgb } from './colour-mesh';

/** Everything in one segment, from z = 0 to z = L; every pattern repeats exactly within it. */
const L = SEGMENT_LENGTH_M;
/** Each layer of a pattern stands this much further off the wall than the one behind it. */
const LAYER_M = 0.008;
const DISC_SEGMENTS = 28;
/** Patterns repeat every 2.5 m, eight times a segment (design: the discs' own spacing). */
const PERIOD_M = MURAL_DISC_SPACING_M;
/** Zigzags: three lines across the band, this tall and this thick (design). */
const ZIGZAG_LINES = 3;
const ZIGZAG_AMPLITUDE_M = 0.22;
const ZIGZAG_THICKNESS_M = 0.1;
/** Space: a planet every 5 m at a seeded height, and a field of small diamond stars (design). */
const PLANET_SPACING_M = 5;
const PLANET_RADII_M = [0.55, 0.35, 0.7, 0.42] as const;
const STARS = 36;
const STAR_SIZE_M = { min: 0.04, max: 0.1 } as const;
/** A fixed seed: every segment has the same sky, so the recycled segments join without seams. */
const SKY_SEED = 7;
/** Waves: three stacked bands with sine tops, drawn in 0.25 m steps (design). */
const WAVE_AMPLITUDE_M = 0.15;
const WAVE_STEP_M = 0.25;
/** Checks: three rows of 0.4 m squares across the middle of the band (design). */
const CHECK_SIZE_M = 0.4;
const CHECK_ROWS = 3;

/** Where a pattern is drawn: the wall's plane, the side it faces from, and the band's height. */
export interface MuralBand {
  readonly side: -1 | 1;
  /** The wall's plane, already lifted off it. */
  readonly x: number;
  readonly bottomM: number;
  readonly topM: number;
}

type Painter = (builder: ColourMeshBuilder, band: MuralBand, colours: readonly Rgb[], palette: AlleyPalette) => void;

const lifted = (band: MuralBand, layer: number): number => band.x - band.side * LAYER_M * layer;
const colourAt = (colours: readonly Rgb[], i: number, fallback: Rgb): Rgb => colours[i % colours.length] ?? fallback;

/** A flat quad in the wall's plane between heights y0, y1 at z0 and y2, y3 at z1. */
function wallQuad(builder: ColourMeshBuilder, x: number, z0: number, z1: number, [y0, y1, y2, y3]: readonly [number, number, number, number], colour: Rgb): void {
  builder.quad([[x, y0, z0], [x, y1, z0], [x, y3, z1], [x, y2, z1]], colour);
}

/** Retro: discs of four sizes, evenly along the band. */
const discs: Painter = (builder, band, colours, palette) => {
  const centreY = (band.bottomM + band.topM) / 2;
  const count = Math.round(L / PERIOD_M);
  for (let k = 0; k < count; k += 1) {
    const radius = MURAL_DISC_RADII_M[k % MURAL_DISC_RADII_M.length] ?? MURAL_DISC_RADII_M[0];
    builder.discAcrossX([lifted(band, 1), centreY, (k + 0.5) * PERIOD_M], radius, DISC_SEGMENTS, colourAt(colours, k, palette.surfaces.stripe));
  }
};

/** Neon: three zigzag lines, each a chain of thick strokes. */
const zigzag: Painter = (builder, band, colours, palette) => {
  const half = PERIOD_M / 2;
  for (let line = 0; line < ZIGZAG_LINES; line += 1) {
    const centreY = band.bottomM + ((line + 1) * (band.topM - band.bottomM)) / (ZIGZAG_LINES + 1);
    const colour = colourAt(colours, line, palette.surfaces.neon);
    for (let k = 0; k < Math.round(L / half); k += 1) {
      const up = k % 2 === 0 ? 1 : -1;
      const [ya, yb] = [centreY - up * ZIGZAG_AMPLITUDE_M, centreY + up * ZIGZAG_AMPLITUDE_M];
      const t = ZIGZAG_THICKNESS_M / 2;
      wallQuad(builder, lifted(band, 1), k * half, (k + 1) * half, [ya - t, ya + t, yb - t, yb + t], colour);
    }
  }
};

/** Space: planets at seeded heights and a field of four-pointed stars. */
const stars: Painter = (builder, band, colours, palette) => {
  const random = seededRandom(SKY_SEED);
  const height = band.topM - band.bottomM;
  for (let i = 0; i < STARS; i += 1) {
    const [y, z] = [band.bottomM + random() * height, random() * L];
    const size = STAR_SIZE_M.min + random() * (STAR_SIZE_M.max - STAR_SIZE_M.min);
    const x = lifted(band, 1);
    builder.quad([[x, y - size, z], [x, y, z - size], [x, y + size, z], [x, y, z + size]], palette.surfaces.stripe);
  }
  for (let k = 0; k < Math.round(L / PLANET_SPACING_M); k += 1) {
    const radius = PLANET_RADII_M[k % PLANET_RADII_M.length] ?? PLANET_RADII_M[0];
    const y = band.bottomM + radius + random() * (height - 2 * radius);
    builder.discAcrossX([lifted(band, 2), y, (k + 0.5) * PLANET_SPACING_M], radius, DISC_SEGMENTS, colourAt(colours, k, palette.surfaces.stripe));
  }
};

/** Tropical: three stacked sea bands with wavy tops; the lowest is nearest the room. */
const waves: Painter = (builder, band, colours, palette) => {
  const bands = colours.length;
  const height = band.topM - band.bottomM;
  for (let b = bands - 1; b >= 0; b -= 1) {
    const level = band.bottomM + ((b + 1) * height) / (bands + 1);
    const top = (z: number): number => level + WAVE_AMPLITUDE_M * Math.sin((2 * Math.PI * z) / PERIOD_M + b);
    const colour = colourAt(colours, b, palette.surfaces.stripe);
    for (let z = 0; z < L; z += WAVE_STEP_M) {
      const z1 = Math.min(L, z + WAVE_STEP_M);
      wallQuad(builder, lifted(band, bands - b), z, z1, [band.bottomM, top(z), band.bottomM, top(z1)], colour);
    }
  }
};

/** Diner: a checkerboard across the middle of the band. */
const checks: Painter = (builder, band, colours, palette) => {
  const bottom = (band.bottomM + band.topM) / 2 - (CHECK_ROWS * CHECK_SIZE_M) / 2;
  for (let row = 0; row < CHECK_ROWS; row += 1) {
    for (let col = 0; col < Math.round(L / CHECK_SIZE_M); col += 1) {
      const y0 = bottom + row * CHECK_SIZE_M;
      const colour = colourAt(colours, row + col, palette.surfaces.topBand);
      wallQuad(builder, lifted(band, 1), col * CHECK_SIZE_M, (col + 1) * CHECK_SIZE_M, [y0, y0 + CHECK_SIZE_M, y0, y0 + CHECK_SIZE_M], colour);
    }
  }
};

const PAINTERS: Readonly<Record<AlleyPalette['motif'], Painter>> = { discs, zigzag, stars, waves, checks };

/** Paints the theme's pattern on one wall's mural band (wiki/models/lane.md, rule 6). */
export function addMural(builder: ColourMeshBuilder, band: MuralBand, palette: AlleyPalette): void {
  PAINTERS[palette.motif](builder, band, palette.motifColours, palette);
}
