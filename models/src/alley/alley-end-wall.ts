import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { ALLEY_HALF_WIDTH_M, CEILING_HEIGHT_M, MASKING_UNIT_BOTTOM_M, MURAL_TOP_M, NEON_LINE_HEIGHT_M } from '../measures/alley';
import { PIT_DROP_M } from '../measures/lane';
import type { ModelFactory, ModelHandle } from '../model-handle';
import { decorMaterial } from './alley-material';
import { addMural } from './alley-murals';
import { alleyPalette, WALL_SHADE } from './alley-palette';
import { ColourMeshBuilder, type Rgb } from './colour-mesh';
import type { Scenery } from './scenery-themes';

export interface AlleyEndWallOptions {
  /** The room's theme, the same as its side walls' (wiki/models/lane.md, rule 6). */
  readonly scenery: Scenery;
}

const WIDTH_M = 2 * ALLEY_HALF_WIDTH_M;
/** The pinsetter openings under the masking unit: near black, whatever the theme (design). */
const OPENING: Rgb = [0.012, 0.012, 0.016];
/** The trim under the painted panel, as tall as the side walls' stripe (design). */
const TRIM_HEIGHT_M = 0.14;
/** Each layer stands this far nearer the room than the one behind it. */
const LIFT_M = 0.01;

/**
 * The end wall of the room (wiki/models/lane.md, rule 6): dark pinsetter openings across the whole
 * width, and above them the masking unit painted in the room's theme — a neon line, a trim, the
 * mural's pattern, the top band. Built in the plane of a side wall (x = 0, the band along z) and
 * turned a quarter round, so it reuses the side walls' painters. Root on the lane centre line at
 * the wall, facing the approaching ball (−z).
 */
export const createAlleyEndWall: ModelFactory<AlleyEndWallOptions> = (scene: Scene, { scenery }): ModelHandle => {
  const palette = alleyPalette(scenery);
  const builder = new ColourMeshBuilder();
  // Local x = 0 is the wall; the room is towards +x before the quarter turn, −z after it.
  const band = (x: number, y0: number, y1: number, top: Rgb, foot: Rgb = top): void =>
    builder.quad([[x, y0, 0], [x, y1, 0], [x, y1, WIDTH_M], [x, y0, WIDTH_M]], [foot, top, top, foot]);
  const shade = (rgb: Rgb): Rgb => [rgb[0] * WALL_SHADE, rgb[1] * WALL_SHADE, rgb[2] * WALL_SHADE];
  const { surfaces } = palette;
  band(0, -PIT_DROP_M, MASKING_UNIT_BOTTOM_M, OPENING);
  const panelBottom = MASKING_UNIT_BOTTOM_M + NEON_LINE_HEIGHT_M + TRIM_HEIGHT_M;
  band(0, MASKING_UNIT_BOTTOM_M, MURAL_TOP_M, surfaces.mural, shade(surfaces.mural));
  band(0, MURAL_TOP_M, CEILING_HEIGHT_M, surfaces.topBand);
  band(LIFT_M, MASKING_UNIT_BOTTOM_M, MASKING_UNIT_BOTTOM_M + NEON_LINE_HEIGHT_M, surfaces.neon);
  band(LIFT_M, MASKING_UNIT_BOTTOM_M + NEON_LINE_HEIGHT_M, panelBottom, surfaces.stripe);
  addMural(builder, { side: -1, x: LIFT_M, lengthM: WIDTH_M, bottomM: panelBottom, topM: MURAL_TOP_M - NEON_LINE_HEIGHT_M }, palette);
  band(LIFT_M, MURAL_TOP_M - NEON_LINE_HEIGHT_M, MURAL_TOP_M, surfaces.neon);

  const root = new TransformNode('alley-end-wall', scene);
  const wall = builder.build('alley-end-wall-decor', scene);
  wall.material = decorMaterial(scene);
  wall.parent = root;
  // A quarter turn about y: the band's z runs across the room (x), the room side (+x) faces −z.
  wall.rotation.y = Math.PI / 2;
  wall.position.x = -ALLEY_HALF_WIDTH_M;
  return { root, dispose: () => root.dispose(false, false) };
};
