import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import type { Scene } from '@babylonjs/core/scene';
import {
  ARROW_BOARDS,
  ARROWS_FROM_FOUL_LINE_M,
  BOARD_WIDTH_M,
  BOARDS_SURFACE_WIDTH_M,
  boardCentreX,
  DOT_BOARDS,
  DOTS_FROM_FOUL_LINE_M,
  FOUL_LINE_WIDTH_M,
  LANE_INDICES,
} from '../measures/lane';

/** Markings float this far above the boards, enough to avoid z-fighting at 500 m of depth range. */
const MARKING_LIFT_M = 0.001;
/** Arrows: about 6 in long and one board wide; the centre arrow is the farthest, 1 ft beyond the outer ones. */
const ARROW_LENGTH_M = 0.15;
const ARROW_HALF_WIDTH_M = BOARD_WIDTH_M / 2;
const ARROW_STAGGER_M = 0.3048 / 3;
const CENTRE_BOARD = 20;
const BOARDS_PER_ARROW_STEP = 5;
/** Dots: about 1 in across, drawn as hexagons. */
const DOT_RADIUS_M = 0.0127;
const DOT_SIDES = 6;

/** Flat-shape builder: every shape lies at y = MARKING_LIFT_M, triangles facing up. */
class FlatShapes {
  readonly positions: number[] = [];
  readonly indices: number[] = [];

  /** Adds a polygon given as a fan around its first point (counter-clockwise seen from above). */
  fan(points: ReadonlyArray<readonly [number, number]>): void {
    const base = this.positions.length / 3;
    for (const [x, z] of points) this.positions.push(x, MARKING_LIFT_M, z);
    for (let i = 1; i < points.length - 1; i += 1) this.indices.push(base, base + i + 1, base + i);
  }
}

/**
 * The regulation markings of one lane start, for the three travel lanes: the foul line at
 * `foulLineZ`, the dots and the arrows past it (wiki/models/lane.md, rule 2).
 */
export function createMarkingsMesh(name: string, scene: Scene, foulLineZ: number): Mesh {
  const shapes = new FlatShapes();
  const half = BOARDS_SURFACE_WIDTH_M / 2;
  shapes.fan([[-half, foulLineZ], [half, foulLineZ], [half, foulLineZ + FOUL_LINE_WIDTH_M], [-half, foulLineZ + FOUL_LINE_WIDTH_M]]);
  for (const lane of LANE_INDICES) {
    for (const board of DOT_BOARDS) {
      const x = boardCentreX(lane, board);
      const z = foulLineZ + DOTS_FROM_FOUL_LINE_M;
      shapes.fan(Array.from({ length: DOT_SIDES }, (_, k): readonly [number, number] => {
        const a = (2 * Math.PI * k) / DOT_SIDES;
        return [x + Math.cos(a) * DOT_RADIUS_M, z + Math.sin(a) * DOT_RADIUS_M];
      }));
    }
    for (const board of ARROW_BOARDS) {
      const x = boardCentreX(lane, board);
      const stepsFromCentre = Math.abs(board - CENTRE_BOARD) / BOARDS_PER_ARROW_STEP;
      const tip = foulLineZ + ARROWS_FROM_FOUL_LINE_M - stepsFromCentre * ARROW_STAGGER_M;
      shapes.fan([[x, tip], [x + ARROW_HALF_WIDTH_M, tip - ARROW_LENGTH_M], [x - ARROW_HALF_WIDTH_M, tip - ARROW_LENGTH_M]]);
    }
  }
  const data = new VertexData();
  data.positions = shapes.positions;
  data.indices = shapes.indices;
  const normals: number[] = [];
  VertexData.ComputeNormals(shapes.positions, shapes.indices, normals);
  data.normals = normals;
  const mesh = new Mesh(name, scene);
  data.applyToMesh(mesh);
  return mesh;
}
