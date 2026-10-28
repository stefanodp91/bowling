import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import type { Scene } from '@babylonjs/core/scene';
import { PROP_SCALE } from '../../measures/scale';
import { isInCollar, outlineHalfWidth, SOLE_HEIGHT_M, tToZ, upperHeight, zoneAt, type ShoeZone } from './shoe-shape';

/** Stations along the length and points around each cross-section of the upper. */
const STATIONS = 80;
const ARC_POINTS = 44;
/** Superellipse exponent of the cross-section: 2 is an ellipse, higher is boxier (a last's shape). */
const SECTION_EXPONENT = 2.6;
/** The foxing band at the bottom of the upper, and the insole's height above the sole. */
const FOXING_M = 0.008 * PROP_SCALE;
const INSOLE_LIFT_M = 0.004 * PROP_SCALE;

type Rgba = readonly [number, number, number, number];
/** Classic rental colours (red, blue, grey leather; grey foxing; tan sole; dark insole). */
export const SHOE_COLOURS: Readonly<Record<ShoeZone | 'foxing' | 'sole' | 'insole', Rgba>> = {
  heel: [0.1, 0.18, 0.42, 1],
  quarter: [0.72, 0.7, 0.66, 1],
  vamp: [0.6, 0.07, 0.07, 1],
  foxing: [0.45, 0.45, 0.45, 1],
  sole: [0.55, 0.4, 0.26, 1],
  insole: [0.12, 0.08, 0.06, 1],
};

class MeshParts {
  readonly positions: number[] = [];
  readonly colors: number[] = [];
  readonly indices: number[] = [];

  vertex(x: number, y: number, z: number, colour: Rgba): number {
    this.positions.push(x, y, z);
    this.colors.push(...colour);
    return this.positions.length / 3 - 1;
  }

  quad(a: number, b: number, c: number, d: number): void {
    this.indices.push(a, b, c, a, c, d);
  }
}

/** Points of the outline at height y, heel to toe on the +x side then back on the -x side. */
function outline(y: number): Array<readonly [number, number, number]> {
  const right = Array.from({ length: STATIONS + 1 }, (_, i): readonly [number, number, number] => {
    const t = i / STATIONS;
    return [outlineHalfWidth(t), y, tToZ(t)];
  });
  const left = right.slice(1, -1).reverse().map(([x, yy, z]): readonly [number, number, number] => [-x, yy, z]);
  return [...right, ...left];
}

function addCap(parts: MeshParts, ring: ReadonlyArray<readonly [number, number, number]>, colour: Rgba, facingUp: boolean): void {
  const centre = parts.vertex(0, ring[0]?.[1] ?? 0, tToZ(0.5), colour);
  const first = parts.positions.length / 3;
  for (const [x, y, z] of ring) parts.vertex(x, y, z, colour);
  for (let i = 0; i < ring.length; i += 1) {
    const a = first + i;
    const b = first + ((i + 1) % ring.length);
    if (facingUp) parts.indices.push(centre, b, a);
    else parts.indices.push(centre, a, b);
  }
}

function addSole(parts: MeshParts): void {
  const bottom = outline(0);
  const top = outline(SOLE_HEIGHT_M);
  addCap(parts, bottom, SHOE_COLOURS.sole, false);
  addCap(parts, outline(SOLE_HEIGHT_M + INSOLE_LIFT_M), SHOE_COLOURS.insole, true);
  const firstBottom = parts.positions.length / 3;
  for (const [x, y, z] of bottom) parts.vertex(x, y, z, SHOE_COLOURS.sole);
  const firstTop = parts.positions.length / 3;
  for (const [x, y, z] of top) parts.vertex(x, y, z, SHOE_COLOURS.sole);
  for (let i = 0; i < bottom.length; i += 1) {
    const j = (i + 1) % bottom.length;
    parts.quad(firstBottom + i, firstTop + i, firstTop + j, firstBottom + j);
  }
}

/** y of the upper's surface at the arc angle θ (0 = +x side, π/2 = top, π = -x side). */
function sectionPoint(t: number, theta: number): readonly [number, number] {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const e = 2 / SECTION_EXPONENT;
  return [outlineHalfWidth(t) * Math.sign(c) * Math.abs(c) ** e, SOLE_HEIGHT_M + upperHeight(t) * Math.abs(s) ** e];
}

function addUpper(parts: MeshParts): void {
  const grid: number[][] = [];
  for (let i = 0; i <= STATIONS; i += 1) {
    const t = i / STATIONS;
    const row: number[] = [];
    for (let k = 0; k <= ARC_POINTS; k += 1) {
      const [x, y] = sectionPoint(t, (Math.PI * k) / ARC_POINTS);
      const colour = y < SOLE_HEIGHT_M + FOXING_M ? SHOE_COLOURS.foxing : SHOE_COLOURS[zoneAt(t)];
      row.push(parts.vertex(x, y, tToZ(t), colour));
    }
    grid.push(row);
  }
  for (let i = 0; i < STATIONS; i += 1) {
    for (let k = 0; k < ARC_POINTS; k += 1) {
      const t = (i + 0.5) / STATIONS;
      const [x] = sectionPoint(t, (Math.PI * (k + 0.5)) / ARC_POINTS);
      if (isInCollar(t, x)) continue; // the foot opening: the dark insole shows through
      const a = grid[i]?.[k] ?? 0;
      const b = grid[i + 1]?.[k] ?? 0;
      const c = grid[i + 1]?.[k + 1] ?? 0;
      const d = grid[i]?.[k + 1] ?? 0;
      parts.quad(a, d, c, b);
    }
  }
}

/** One shoe (right foot, toe towards +z) as a single vertex-coloured mesh; `mirrored` gives the left. */
export function createShoeMesh(name: string, scene: Scene, mirrored: boolean): Mesh {
  const parts = new MeshParts();
  addSole(parts);
  addUpper(parts);
  const positions = parts.positions.map((v, i) => (mirrored && i % 3 === 0 ? -v : v));
  const indices = mirrored ? parts.indices.map((_, i, all) => all[i - (i % 3) + (2 - (i % 3))] ?? 0) : parts.indices;
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  const data = new VertexData();
  data.positions = positions;
  data.indices = indices;
  data.normals = normals;
  data.colors = parts.colors;
  const mesh = new Mesh(name, scene);
  data.applyToMesh(mesh);
  return mesh;
}
