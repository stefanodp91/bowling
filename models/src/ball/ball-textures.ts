import { Constants } from '@babylonjs/core/Engines/constants';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import type { Scene } from '@babylonjs/core/scene';
import { BALL_WEIGHT_LB } from '../measures/ball';
import { GLYPH_HEIGHT, GLYPH_WIDTH, glyphInk } from '../procedural/digit-glyphs';
import { seededRandom } from '../procedural/seeded-random';
import { createNoise3 } from '../procedural/value-noise';

/** Texture size: equirectangular, twice as wide as tall, like the sphere's UVs. */
const WIDTH = 1024;
const HEIGHT = 512;
const CHANNELS = 4;
const BYTE_MAX = 255;

type Rgb = readonly [number, number, number];

/** The direction on the unit sphere that the texel (u, v) covers (Babylon sphere UVs). */
function directionOf(u: number, v: number): readonly [number, number, number] {
  const polar = Math.PI * v;
  const azimuth = 2 * Math.PI * u;
  return [Math.sin(polar) * Math.cos(azimuth), Math.cos(polar), -Math.sin(polar) * Math.sin(azimuth)];
}

function fill(colorAt: (u: number, v: number) => Rgb): Uint8Array {
  const data = new Uint8Array(WIDTH * HEIGHT * CHANNELS);
  for (let row = 0; row < HEIGHT; row += 1) {
    for (let col = 0; col < WIDTH; col += 1) {
      const rgb = colorAt((col + 0.5) / WIDTH, (row + 0.5) / HEIGHT);
      const o = (row * WIDTH + col) * CHANNELS;
      data[o] = Math.round(Math.min(1, rgb[0]) * BYTE_MAX);
      data[o + 1] = Math.round(Math.min(1, rgb[1]) * BYTE_MAX);
      data[o + 2] = Math.round(Math.min(1, rgb[2]) * BYTE_MAX);
      data[o + 3] = BYTE_MAX;
    }
  }
  return data;
}

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/**
 * Player ball: deep blue-violet reactive resin (wiki/models/ball.md, rule 3). Reactive covers show
 * broad, smeared swirls of two or three tones rather than thin veins: two layers of strongly
 * warped noise, blended softly.
 */
const PLAYER_DEEP: Rgb = [0.04, 0.02, 0.2];
const PLAYER_MID: Rgb = [0.27, 0.1, 0.58];
const PLAYER_PEARL: Rgb = [0.55, 0.5, 0.95];
/** Frequency of the swirl over the unit sphere, and how far noise drags it (domain warp). */
const SWIRL_FREQUENCY = 1.3;
const SWIRL_WARP = 2.4;
/** Swirl bands per unit of warped coordinate, and how soft their edges are. */
const SWIRL_BANDS = 2.2;
const PEARL_SHARPNESS = 2.5;

export function playerMarbleData(seed: number): Uint8Array {
  const noise = createNoise3(seededRandom(seed));
  return fill((u, v) => {
    const [x, y, z] = directionOf(u, v);
    const f = SWIRL_FREQUENCY;
    const wx = x + SWIRL_WARP * (noise.fbm(x * f, y * f, z * f) - 0.5);
    const wy = y + SWIRL_WARP * (noise.fbm(x * f + 17, y * f, z * f) - 0.5);
    const wz = z + SWIRL_WARP * (noise.fbm(x * f, y * f + 31, z * f) - 0.5);
    const swirl = 0.5 + 0.5 * Math.sin((wx + 0.7 * wy + 0.4 * wz) * SWIRL_BANDS * Math.PI);
    const body = mix(PLAYER_DEEP, PLAYER_MID, noise.fbm(wx * 2, wy * 2, wz * 2));
    return mix(body, PLAYER_PEARL, Math.pow(swirl, PEARL_SHARPNESS) * noise.fbm(wz * 3, wx * 3, wy * 3));
  });
}

/** House ball: plain red polyester, slightly scuffed, with its weight printed in white. */
const HOUSE_RED: Rgb = [0.62, 0.05, 0.04];
const HOUSE_SCUFF: Rgb = [0.78, 0.55, 0.52];
const HOUSE_PRINT: Rgb = [0.95, 0.94, 0.9];
/** Scuffs: fine streaks where high-frequency noise passes this threshold. */
const SCUFF_FREQUENCY = 18;
const SCUFF_THRESHOLD = 0.78;
const SCUFF_STRENGTH = 0.6;
/**
 * The printed number, as on real house balls, beside the grip: centre of the label in UV
 * (u = 0.5 is the ball's -x side, v = 0.24 is 43° from the grip pole) and the size of one glyph
 * cell in texels (a digit ≈ 18 mm tall).
 */
const LABEL_U = 0.5;
const LABEL_V = 0.24;
const CELL_TEXELS = 8;
const GLYPH_GAP_CELLS = 1;

function printedAt(u: number, v: number, text: string): boolean {
  const columns = text.length * (GLYPH_WIDTH + GLYPH_GAP_CELLS) - GLYPH_GAP_CELLS;
  // u grows towards +z, which a viewer facing the label sees as leftwards: columns run against u.
  const col = Math.floor((LABEL_U * WIDTH - u * WIDTH) / CELL_TEXELS + columns / 2);
  const row = Math.floor((v * HEIGHT - LABEL_V * HEIGHT) / CELL_TEXELS + GLYPH_HEIGHT / 2);
  if (col < 0 || row < 0 || col >= columns || row >= GLYPH_HEIGHT) return false;
  const glyph = Math.floor(col / (GLYPH_WIDTH + GLYPH_GAP_CELLS));
  const glyphColumn = col % (GLYPH_WIDTH + GLYPH_GAP_CELLS);
  return glyphColumn < GLYPH_WIDTH && glyphInk(text[glyph] ?? '', glyphColumn, row);
}

export function houseBallData(seed: number): Uint8Array {
  const noise = createNoise3(seededRandom(seed));
  const label = String(BALL_WEIGHT_LB);
  return fill((u, v) => {
    if (printedAt(u, v, label)) return HOUSE_PRINT;
    const [x, y, z] = directionOf(u, v);
    const streak = noise.value(x * SCUFF_FREQUENCY, y * SCUFF_FREQUENCY * 0.2, z * SCUFF_FREQUENCY);
    const scuff = streak > SCUFF_THRESHOLD ? ((streak - SCUFF_THRESHOLD) / (1 - SCUFF_THRESHOLD)) * SCUFF_STRENGTH : 0;
    return mix(HOUSE_RED, HOUSE_SCUFF, scuff);
  });
}

export function rawBallTexture(name: string, data: Uint8Array, scene: Scene): RawTexture {
  const texture = RawTexture.CreateRGBATexture(data, WIDTH, HEIGHT, scene, true, false, Constants.TEXTURE_TRILINEAR_SAMPLINGMODE);
  texture.name = name;
  return texture;
}
