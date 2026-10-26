import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
// Side effect: Mesh.createInstance lives in this module (Babylon tree-shaking, AGENTS.md traps).
import '@babylonjs/core/Meshes/instancedMesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { BOARDS_SURFACE_WIDTH_M, GUTTER_DEPTH_M, GUTTER_WIDTH_M, SEGMENT_LENGTH_M } from '../measures/lane';
import type { ModelFactory, ModelHandle } from '../model-handle';
import { boardMaterial, gutterMaterial, markingMaterial } from './lane-materials';
import { createMarkingsMesh } from './markings-geometry';
import { createTroughMesh } from './trough-geometry';

export interface LaneSegmentOptions {
  /** Local z of a foul line inside this segment, with its dots and arrows; none if omitted. */
  readonly foulLineZ?: number;
}

/** A segment handle also makes instances of itself, for the scene to place along the lane. */
export interface LaneSegmentHandle extends ModelHandle {
  /** A new root holding an instance of every mesh of the segment, sharing geometry and materials. */
  instantiate(name: string): TransformNode;
}

/**
 * One 20 m segment of the playing surface (wiki/models/lane.md, rule 4): the boards of the three
 * travel lanes and the two outer gutters, with optional markings. Root at the segment start on the
 * lane's centre line, surface at y = 0, segment along +z.
 */
export const createLaneSegment: ModelFactory<LaneSegmentOptions, LaneSegmentHandle> = (scene: Scene, options): LaneSegmentHandle => {
  const root = new TransformNode('lane-segment', scene);
  const boards = CreateGround('lane-boards', { width: BOARDS_SURFACE_WIDTH_M, height: SEGMENT_LENGTH_M }, scene);
  boards.position.z = SEGMENT_LENGTH_M / 2;
  boards.bakeCurrentTransformIntoVertices();
  boards.material = boardMaterial(scene);
  const meshes: Mesh[] = [boards];
  for (const side of [-1, 1]) {
    const gutter = createTroughMesh(`lane-gutter-${side < 0 ? 'left' : 'right'}`, scene, {
      widthM: GUTTER_WIDTH_M,
      depthM: GUTTER_DEPTH_M,
      startZ: 0,
      lengthM: SEGMENT_LENGTH_M,
      centreX: side * (BOARDS_SURFACE_WIDTH_M / 2 + GUTTER_WIDTH_M / 2),
    });
    gutter.material = gutterMaterial(scene);
    meshes.push(gutter);
  }
  if (options.foulLineZ !== undefined) {
    const markings = createMarkingsMesh('lane-markings', scene, options.foulLineZ);
    markings.material = markingMaterial(scene);
    meshes.push(markings);
  }
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
