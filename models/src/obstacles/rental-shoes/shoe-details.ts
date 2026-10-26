import { Constants } from '@babylonjs/core/Engines/constants';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { CreateTube } from '@babylonjs/core/Meshes/Builders/tubeBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Scene } from '@babylonjs/core/scene';
import { perScene } from '../../materials/scene-cache';
import { GLYPH_HEIGHT, GLYPH_WIDTH, glyphInk } from '../../procedural/digit-glyphs';
import { LACE_RANGE, outlineHalfWidth, SOLE_HEIGHT_M, tToZ, upperHeight } from './shoe-shape';

/** Laces: round cord ≈ 4.5 mm thick, lying just on the upper. */
const LACE_RADIUS_M = 0.0022;
const LACE_LIFT_M = 0.002;
const LACE_TESSELLATION = 6;
const SECTION_EXPONENT = 2.6;

/** Height of the upper at x across the section of t (same superellipse as the shell). */
function upperYAt(t: number, x: number): number {
  const w = outlineHalfWidth(t);
  return SOLE_HEIGHT_M + upperHeight(t) * Math.max(0, 1 - Math.abs(x / w) ** SECTION_EXPONENT) ** (1 / SECTION_EXPONENT);
}

/** The criss-crossed laces of one shoe, as one mesh. */
export function createLacesMesh(name: string, scene: Scene, mirrored: boolean): Mesh {
  const { fromT, toT, eyeletXM, crossings } = LACE_RANGE;
  const sign = mirrored ? -1 : 1;
  const point = (t: number, x: number): Vector3 => new Vector3(sign * x, upperYAt(t, x) + LACE_LIFT_M, tToZ(t));
  const tubes: Mesh[] = [];
  for (let i = 0; i < crossings; i += 1) {
    const t0 = fromT + ((toT - fromT) * i) / crossings;
    const t1 = fromT + ((toT - fromT) * (i + 1)) / crossings;
    for (const side of [-1, 1]) {
      const path = [point(t0, side * eyeletXM), point((t0 + t1) / 2, 0), point(t1, -side * eyeletXM)];
      tubes.push(CreateTube(`${name}-${i}-${side}`, { path, radius: LACE_RADIUS_M, tessellation: LACE_TESSELLATION, cap: Mesh.CAP_ALL }, scene));
    }
  }
  const merged = Mesh.MergeMeshes(tubes, true);
  if (merged === null) throw new Error('laces could not be merged');
  merged.name = name;
  return merged;
}

/** The size printed on the back of the heel (design: a men's US 10). */
export const PRINTED_SIZE = '10';
const LABEL_HEIGHT_M = 0.014;
/** Where along the heel the label sits: far enough in that the rounded heel is as wide as the label. */
const LABEL_T = 0.035;
const LABEL_Y_M = SOLE_HEIGHT_M + 0.04;
/** Texels per glyph cell, and one cell of margin around the digits. */
const CELL = 4;
const MARGIN_CELLS = 1;
const CHANNELS = 4;
const INK: readonly [number, number, number] = [235, 235, 228];
const GROUND: readonly [number, number, number] = [26, 46, 107];

function labelTexture(scene: Scene): RawTexture {
  const columns = PRINTED_SIZE.length * (GLYPH_WIDTH + 1) - 1 + 2 * MARGIN_CELLS;
  const rows = GLYPH_HEIGHT + 2 * MARGIN_CELLS;
  const width = columns * CELL;
  const height = rows * CELL;
  const data = new Uint8Array(width * height * CHANNELS);
  for (let py = 0; py < height; py += 1) {
    for (let px = 0; px < width; px += 1) {
      const col = Math.floor(px / CELL) - MARGIN_CELLS;
      // Texture rows run bottom-up in UV space: flip so the digits stand upright.
      const row = GLYPH_HEIGHT - 1 - (Math.floor(py / CELL) - MARGIN_CELLS);
      const glyph = Math.floor(col / (GLYPH_WIDTH + 1));
      const inGlyph = col % (GLYPH_WIDTH + 1);
      const inked = col >= 0 && inGlyph < GLYPH_WIDTH && glyphInk(PRINTED_SIZE[glyph] ?? '', inGlyph, row);
      const [r, g, b] = inked ? INK : GROUND;
      data.set([r, g, b, 255], (py * width + px) * CHANNELS);
    }
  }
  return RawTexture.CreateRGBATexture(data, width, height, scene, false, false, Constants.TEXTURE_NEAREST_SAMPLINGMODE);
}

export const heelLabelTexture = perScene(labelTexture);

/** The size label on the back of the heel, facing -z (its texture: heelLabelTexture). */
export function createHeelLabel(name: string, scene: Scene): Mesh {
  const { width, height } = heelLabelTexture(scene).getSize();
  const mesh = CreatePlane(name, { width: (LABEL_HEIGHT_M * width) / height, height: LABEL_HEIGHT_M }, scene);
  mesh.position.set(0, LABEL_Y_M, tToZ(LABEL_T) - LACE_LIFT_M);
  return mesh;
}
