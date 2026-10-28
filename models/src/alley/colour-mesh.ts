import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import type { Scene } from '@babylonjs/core/scene';

/** A point in metres, and a linear RGB colour in [0, 1]. */
export type Vec3 = readonly [number, number, number];
export type Rgb = readonly [number, number, number];

const OPAQUE = 1;

/**
 * Collects flat-coloured quads and discs into one mesh with per-vertex colours, so a whole piece of
 * scenery is a single draw call. Faces are drawn from both sides (the material does not cull), so
 * the corner order only has to go round the quad.
 */
export class ColourMeshBuilder {
  private readonly positions: number[] = [];
  private readonly colours: number[] = [];
  private readonly indices: number[] = [];

  /** A quad from four corners in order round its edge, one colour or one colour per corner. */
  quad(corners: readonly [Vec3, Vec3, Vec3, Vec3], colour: Rgb | readonly [Rgb, Rgb, Rgb, Rgb]): void {
    const first = this.positions.length / 3;
    corners.forEach((corner, i) => {
      const rgb = isRgb(colour) ? colour : colour[i] ?? colour[0];
      this.vertex(corner, rgb);
    });
    this.indices.push(first, first + 1, first + 2, first, first + 2, first + 3);
  }

  /** A disc in the plane x = `centre[0]`, facing along x: a triangle fan of `segments` triangles. */
  discAcrossX(centre: Vec3, radiusM: number, segments: number, colour: Rgb): void {
    const first = this.positions.length / 3;
    this.vertex(centre, colour);
    for (let i = 0; i < segments; i += 1) {
      const angle = (2 * Math.PI * i) / segments;
      this.vertex([centre[0], centre[1] + radiusM * Math.sin(angle), centre[2] + radiusM * Math.cos(angle)], colour);
    }
    for (let i = 0; i < segments; i += 1) this.indices.push(first, first + 1 + i, first + 1 + ((i + 1) % segments));
  }

  build(name: string, scene: Scene): Mesh {
    const mesh = new Mesh(name, scene);
    const data = new VertexData();
    data.positions = this.positions;
    data.colors = this.colours;
    data.indices = this.indices;
    const normals: number[] = [];
    VertexData.ComputeNormals(this.positions, this.indices, normals);
    data.normals = normals;
    data.applyToMesh(mesh);
    return mesh;
  }

  private vertex(position: Vec3, colour: Rgb): void {
    this.positions.push(...position);
    this.colours.push(...colour, OPAQUE);
  }
}

function isRgb(colour: Rgb | readonly [Rgb, Rgb, Rgb, Rgb]): colour is Rgb {
  return typeof colour[0] === 'number';
}
