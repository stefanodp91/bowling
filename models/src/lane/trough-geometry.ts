import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import type { Scene } from '@babylonjs/core/scene';

/** Points on the trough's half-ellipse cross-section: smooth enough at chase-camera distance. */
const SECTION_POINTS = 16;

export interface TroughShape {
  readonly widthM: number;
  readonly depthM: number;
  /** z where the trough starts and its length along +z. */
  readonly startZ: number;
  readonly lengthM: number;
  readonly centreX: number;
  /**
   * Depth multiplier along the trough, 0 → flat, 1 → full depth, as a function of the fraction
   * of length (0 at startZ). Defaults to full depth everywhere.
   */
  readonly depthAt?: (fraction: number) => number;
  /** Rings along z: 2 for a constant section, more for a tapering one. */
  readonly rings?: number;
}

/**
 * A rounded gutter channel: a half-ellipse section (width × depth) swept along +z, open at the
 * top, its rim at y = 0. Shared by the lane's outer gutters and the widening-gutter obstacle, so
 * both have the same section (wiki/models/obstacles/widening-gutter.md, rule 1).
 */
export function createTroughMesh(name: string, scene: Scene, shape: TroughShape): Mesh {
  const rings = shape.rings ?? 2;
  const depthAt = shape.depthAt ?? (() => 1);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let ring = 0; ring < rings; ring += 1) {
    const fraction = ring / (rings - 1);
    const z = shape.startZ + fraction * shape.lengthM;
    const depth = shape.depthM * depthAt(fraction);
    for (let p = 0; p <= SECTION_POINTS; p += 1) {
      const angle = Math.PI * (p / SECTION_POINTS);
      positions.push(shape.centreX - Math.cos(angle) * (shape.widthM / 2), -Math.sin(angle) * depth, z);
      uvs.push(p / SECTION_POINTS, fraction);
    }
  }
  const stride = SECTION_POINTS + 1;
  for (let ring = 0; ring < rings - 1; ring += 1) {
    for (let p = 0; p < SECTION_POINTS; p += 1) {
      const a = ring * stride + p;
      const b = a + stride;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  const data = new VertexData();
  data.positions = positions;
  data.indices = indices;
  data.normals = normals;
  data.uvs = uvs;
  const mesh = new Mesh(name, scene);
  data.applyToMesh(mesh);
  return mesh;
}
