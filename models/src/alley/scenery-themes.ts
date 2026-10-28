/**
 * The alley's themes (wiki/models/lane.md, rule 6): one per track, a human's request of 2026-10-28
 * that the room change with the chosen track. Colours are sRGB hex, as a designer writes them; the
 * palette module turns them into linear vertex colours. Pure data: tools read it too.
 */

export const SCENERIES = ['retro', 'neon', 'space', 'tropical', 'diner'] as const;
export type Scenery = (typeof SCENERIES)[number];

/** The pattern painted on the mural band of the side walls. */
export type MuralMotif = 'discs' | 'zigzag' | 'stars' | 'waves' | 'checks';

export interface SceneryTheme {
  /** The room's surfaces: floor pieces, wall bands, ceiling and its lights. */
  readonly surfaces: {
    readonly capping: string;
    readonly cappingSide: string;
    readonly gutter: string;
    readonly carpet: string;
    readonly wainscot: string;
    readonly mural: string;
    readonly topBand: string;
    readonly stripe: string;
    readonly neon: string;
    readonly ceiling: string;
    readonly beam: string;
    readonly light: string;
  };
  readonly motif: MuralMotif;
  /** The motif's colours, cycled along the wall. */
  readonly motifColours: readonly string[];
  /** The haze the far end of the room fades into: the fog and the clear colour of the scene. */
  readonly haze: string;
}

export const SCENERY_THEMES = {
  /** Teal and cream walls with orange, mustard and pink discs, a purple carpet (the first alley). */
  retro: {
    surfaces: {
      capping: '#6B4A32',
      cappingSide: '#4A3222',
      gutter: '#2A2B30',
      carpet: '#4B2F6E',
      wainscot: '#145A64',
      mural: '#F1E4CC',
      topBand: '#1F8A8A',
      stripe: '#F2B33D',
      neon: '#FF6FB0',
      ceiling: '#2C2338',
      beam: '#1E1828',
      light: '#FFF3D6',
    },
    motif: 'discs',
    motifColours: ['#F28C28', '#E85D75', '#2BB3B1', '#F2C14E'],
    haze: '#3B2D4A',
  },
  /** A dark room lit by pink and cyan neon zigzags. */
  neon: {
    surfaces: {
      capping: '#2A2A35',
      cappingSide: '#1C1C24',
      gutter: '#18181E',
      carpet: '#1B1036',
      wainscot: '#121226',
      mural: '#1A1433',
      topBand: '#0E0B1E',
      stripe: '#00E5FF',
      neon: '#FF2BD6',
      ceiling: '#0D0A18',
      beam: '#08060F',
      light: '#B8F3FF',
    },
    motif: 'zigzag',
    motifColours: ['#FF2BD6', '#00E5FF', '#B26BFF'],
    haze: '#1A1030',
  },
  /** Night blue walls with planets and stars. */
  space: {
    surfaces: {
      capping: '#3A3F55',
      cappingSide: '#262A3A',
      gutter: '#1E2130',
      carpet: '#14204A',
      wainscot: '#0F1A3D',
      mural: '#0B1230',
      topBand: '#1C2A66',
      stripe: '#C9D6FF',
      neon: '#7FD8FF',
      ceiling: '#070B1C',
      beam: '#050814',
      light: '#DDE8FF',
    },
    motif: 'stars',
    motifColours: ['#F2A65A', '#7FD8FF', '#E86F8A', '#9ADF7F'],
    haze: '#0F1636',
  },
  /** Green and coral, with sea waves along the walls. */
  tropical: {
    surfaces: {
      capping: '#7A5432',
      cappingSide: '#563A22',
      gutter: '#2A2B30',
      carpet: '#0F6B5C',
      wainscot: '#0E7C6B',
      mural: '#FFE9C7',
      topBand: '#FF7F66',
      stripe: '#FFD166',
      neon: '#3FD3C6',
      ceiling: '#18413B',
      beam: '#10302B',
      light: '#FFF4D6',
    },
    motif: 'waves',
    motifColours: ['#2EC4B6', '#FF7F66', '#FFD166'],
    haze: '#2E5A55',
  },
  /** A fifties diner: red, cream and chrome, with a black and white checkerboard. */
  diner: {
    surfaces: {
      capping: '#6B4A32',
      cappingSide: '#4A3222',
      gutter: '#2A2B30',
      carpet: '#7A1420',
      wainscot: '#B3121F',
      mural: '#F6EFE0',
      topBand: '#1A1A1A',
      stripe: '#C9CDD2',
      neon: '#FF3B3B',
      ceiling: '#24181A',
      beam: '#1A1112',
      light: '#FFF0E0',
    },
    motif: 'checks',
    motifColours: ['#111111', '#F6EFE0'],
    haze: '#3A2226',
  },
} as const satisfies Readonly<Record<Scenery, SceneryTheme>>;
