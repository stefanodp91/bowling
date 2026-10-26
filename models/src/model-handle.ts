import type { Scene } from '@babylonjs/core/scene';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';

/** What every model factory returns (wiki/models/conventions.md, «The factory contract»). */
export interface ModelHandle {
  /** Parent of every mesh of the model; origin at the model's ground contact point, +z forward. */
  readonly root: TransformNode;
  /** Per-frame animation, if the model has one; pure function of elapsed seconds. */
  readonly animate?: (elapsedS: number) => void;
  /** Releases meshes, materials and textures the factory created. */
  dispose(): void;
}

/** A function that builds one model in a scene. */
export type ModelFactory<Options> = (scene: Scene, options: Options) => ModelHandle;
