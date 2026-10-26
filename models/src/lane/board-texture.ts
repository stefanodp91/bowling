import { Constants } from '@babylonjs/core/Engines/constants';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { Scene } from '@babylonjs/core/scene';
import { BOARDS_PER_LANE, SEGMENT_LENGTH_M, TRAVEL_LANES } from '../measures/lane';
import { seededRandom } from '../procedural/seeded-random';
import { createNoise3 } from '../procedural/value-noise';

/** Texels per board across, and texels along z for one repeat of the texture. */
const TEXELS_PER_BOARD = 8;
const REPEAT_TEXELS = 512;
/** One repeat of the texture covers this many metres along the lane. */
export const BOARD_TEXTURE_REPEAT_M = 2;
const CHANNELS = 4;
const BYTE_MAX = 255;
const SEED = 1;
/** Anisotropic filtering keeps the boards sharp at the grazing angles of a long lane. */
const ANISOTROPY = 8;

type Rgb = readonly [number, number, number];
/** Light maple (lane photos under alley light): a honey tone, boards varying slightly. */
const MAPLE: Rgb = [0.86, 0.69, 0.47];
const MAPLE_DARK: Rgb = [0.7, 0.52, 0.32];
/** How much each board's tone varies, and how strong the grain is. */
const BOARD_TONE_SPREAD = 0.35;
const GRAIN_STRENGTH = 0.35;
/** Grain: noise stretched along the board (z) much more than across it. */
const GRAIN_ACROSS = 3;
const GRAIN_ALONG = 0.08;
/** Seams between boards darken the albedo by this factor; between travel lanes, more. */
const SEAM_SHADE = 0.72;
const LANE_SEAM_SHADE = 0.45;

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** The maple boards of the three travel lanes, repeating every BOARD_TEXTURE_REPEAT_M along z. */
export function boardTextureData(): { data: Uint8Array; width: number; height: number } {
  const boards = BOARDS_PER_LANE * TRAVEL_LANES;
  const width = boards * TEXELS_PER_BOARD;
  const height = REPEAT_TEXELS;
  const random = seededRandom(SEED);
  const tones = Array.from({ length: boards }, () => random());
  const noise = createNoise3(random);
  const data = new Uint8Array(width * height * CHANNELS);
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const board = Math.floor(col / TEXELS_PER_BOARD);
      const inBoard = col % TEXELS_PER_BOARD;
      const tone = (tones[board] ?? 0) * BOARD_TONE_SPREAD;
      // Grain wraps along z: sample noise on a circle so the texture repeats without a seam.
      const angle = (row / height) * 2 * Math.PI;
      const grain = noise.fbm(col / GRAIN_ACROSS + board * 13, Math.cos(angle) / GRAIN_ALONG / (2 * Math.PI), Math.sin(angle) / GRAIN_ALONG / (2 * Math.PI));
      let rgb = mix(MAPLE, MAPLE_DARK, Math.min(1, tone + grain * GRAIN_STRENGTH));
      if (inBoard === 0) {
        const laneEdge = board % BOARDS_PER_LANE === 0 && board !== 0;
        const shade = laneEdge ? LANE_SEAM_SHADE : SEAM_SHADE;
        rgb = [rgb[0] * shade, rgb[1] * shade, rgb[2] * shade];
      }
      const o = (row * width + col) * CHANNELS;
      data[o] = Math.round(rgb[0] * BYTE_MAX);
      data[o + 1] = Math.round(rgb[1] * BYTE_MAX);
      data[o + 2] = Math.round(rgb[2] * BYTE_MAX);
      data[o + 3] = BYTE_MAX;
    }
  }
  return { data, width, height };
}

export function createBoardTexture(scene: Scene): RawTexture {
  const { data, width, height } = boardTextureData();
  const texture = RawTexture.CreateRGBATexture(data, width, height, scene, true, false, Constants.TEXTURE_TRILINEAR_SAMPLINGMODE);
  texture.name = 'lane-boards';
  texture.wrapU = Texture.CLAMP_ADDRESSMODE;
  texture.wrapV = Texture.WRAP_ADDRESSMODE;
  texture.anisotropicFilteringLevel = ANISOTROPY;
  // A lane segment's UVs span its whole length: the boards repeat every BOARD_TEXTURE_REPEAT_M.
  texture.vScale = SEGMENT_LENGTH_M / BOARD_TEXTURE_REPEAT_M;
  return texture;
}
