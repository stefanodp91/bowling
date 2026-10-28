import { Color3 } from '@babylonjs/core/Maths/math.color';
import type { Rgb } from './colour-mesh';
import { SCENERY_THEMES, type MuralMotif, type Scenery, type SceneryTheme } from './scenery-themes';

/** A theme's colours as linear vertex colours (the renderer turns them back into the hex on screen). */
export interface AlleyPalette {
  readonly surfaces: Readonly<Record<keyof SceneryTheme['surfaces'], Rgb>>;
  readonly motif: MuralMotif;
  readonly motifColours: readonly Rgb[];
}

const linear = (hex: string): Rgb => {
  const { r, g, b } = Color3.FromHexString(hex).toLinearSpace();
  return [r, g, b];
};

/** The palette of one theme (wiki/models/lane.md, rule 6). */
export function alleyPalette(scenery: Scenery): AlleyPalette {
  const { surfaces: s, motif, motifColours }: SceneryTheme = SCENERY_THEMES[scenery];
  return {
    surfaces: {
      capping: linear(s.capping),
      cappingSide: linear(s.cappingSide),
      gutter: linear(s.gutter),
      carpet: linear(s.carpet),
      wainscot: linear(s.wainscot),
      mural: linear(s.mural),
      topBand: linear(s.topBand),
      stripe: linear(s.stripe),
      neon: linear(s.neon),
      ceiling: linear(s.ceiling),
      beam: linear(s.beam),
      light: linear(s.light),
    },
    motif,
    motifColours: motifColours.map(linear),
  };
}

/** How much darker the bottom of a wall band is than its top: a soft, baked shade (design). */
export const WALL_SHADE = 0.75;
