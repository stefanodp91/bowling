import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
// Side effect: Mesh.createInstance lives in this module (Babylon tree-shaking, AGENTS.md traps).
import '@babylonjs/core/Meshes/instancedMesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { boardMaterial } from '../lane/lane-materials';
import type { LaneSegmentHandle } from '../lane/lane-segment';
import { NEIGHBOUR_LANES_PER_SIDE, neighbourLaneCentreX } from '../measures/alley';
import { SEGMENT_LENGTH_M, TRAVEL_LANE_WIDTH_M, TRAVEL_LANES } from '../measures/lane';
import type { ModelFactory } from '../model-handle';
import { addCeiling, addFloor, addWall } from './alley-decor';
import { decorMaterial } from './alley-material';
import { alleyPalette } from './alley-palette';
import { ColourMeshBuilder } from './colour-mesh';
import type { Scenery } from './scenery-themes';


/** One neighbouring lane uses one lane's width of the three-lane board texture. */
const BOARD_U_SPAN = 1 / TRAVEL_LANES;

/** The boards of every neighbouring lane in one mesh, sharing the playing surface's material. */
function createNeighbourBoards(scene: Scene): Mesh {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < NEIGHBOUR_LANES_PER_SIDE; i += 1) {
      const centre = side * neighbourLaneCentreX(i);
      const [x0, x1] = [centre - TRAVEL_LANE_WIDTH_M / 2, centre + TRAVEL_LANE_WIDTH_M / 2];
      const first = positions.length / 3;
      positions.push(x0, 0, 0, x1, 0, 0, x1, 0, SEGMENT_LENGTH_M, x0, 0, SEGMENT_LENGTH_M);
      uvs.push(0, 0, BOARD_U_SPAN, 0, BOARD_U_SPAN, 1, 0, 1);
      indices.push(first, first + 1, first + 2, first, first + 2, first + 3);
    }
  }
  const mesh = new Mesh('alley-boards', scene);
  const data = new VertexData();
  data.positions = positions;
  data.uvs = uvs;
  data.indices = indices;
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  data.normals = normals;
  data.applyToMesh(mesh);
  mesh.material = boardMaterial(scene);
  return mesh;
}

export interface AlleySegmentOptions {
  /** The room's theme: each track has its own (wiki/models/lane.md, rule 6). */
  readonly scenery: Scenery;
}

/**
 * One 20 m segment of the room around the playing surface (wiki/models/lane.md, rule 6): cappings,
 * neighbouring lanes, carpet, walls with their mural, ceiling, beams and light strips. Two meshes;
 * the scene recycles instances of it with the lane segments. Root at the segment start on the
 * centre line, floor at y = 0, segment along +z.
 */
export const createAlleySegment: ModelFactory<AlleySegmentOptions, LaneSegmentHandle> = (scene: Scene, { scenery }): LaneSegmentHandle => {
  const root = new TransformNode('alley-segment', scene);
  const palette = alleyPalette(scenery);
  const builder = new ColourMeshBuilder();
  for (const side of [-1, 1] as const) {
    addFloor(builder, side, palette);
    addWall(builder, side, palette);
  }
  addCeiling(builder, palette);
  const decor = builder.build('alley-decor', scene);
  decor.material = decorMaterial(scene);
  const meshes = [decor, createNeighbourBoards(scene)];
  for (const mesh of meshes) mesh.parent = root;
  return {
    root,
    instantiate: (name) => {
      const instanceRoot = new TransformNode(name, scene);
      for (const mesh of meshes) mesh.createInstance(`${name}-${mesh.name}`).parent = instanceRoot;
      return instanceRoot;
    },
    dispose: () => root.dispose(false, false),
  };
};
