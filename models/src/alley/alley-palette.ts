import { Color3 } from '@babylonjs/core/Maths/math.color';
import type { Rgb } from './colour-mesh';

/**
 * The alley's colours (wiki/models/lane.md, rule 6): a cheerful retro room — teal and cream walls
 * with orange, mustard and pink discs, a purple carpet, a dark ceiling with warm light strips and a
 * pink neon line. Written as sRGB hex, used as linear vertex colours (the renderer turns them back
 * into the hex on screen).
 */
const linear = (hex: string): Rgb => {
  const { r, g, b } = Color3.FromHexString(hex).toLinearSpace();
  return [r, g, b];
};

export const ALLEY_COLOURS = {
  capping: linear('#6B4A32'),
  cappingSide: linear('#4A3222'),
  gutter: linear('#2A2B30'),
  carpet: linear('#4B2F6E'),
  wainscot: linear('#145A64'),
  mural: linear('#F1E4CC'),
  topBand: linear('#1F8A8A'),
  stripe: linear('#F2B33D'),
  neon: linear('#FF6FB0'),
  ceiling: linear('#2C2338'),
  beam: linear('#1E1828'),
  light: linear('#FFF3D6'),
} as const;

/** The mural discs cycle through these colours, in the order of MURAL_DISC_RADII_M. */
export const MURAL_DISC_COLOURS: readonly Rgb[] = [linear('#F28C28'), linear('#E85D75'), linear('#2BB3B1'), linear('#F2C14E')];

/** How much darker the bottom of a wall band is than its top: a soft, baked shade (design). */
export const WALL_SHADE = 0.75;
