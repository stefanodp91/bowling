import type { Scene } from '@babylonjs/core/scene';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { ModelFactory, ModelHandle } from '../model-handle';

/** Neutral mid grey of the catalogue floor (wiki/storybook/catalog.md, rule 2). */
const FLOOR_ALBEDO_HEX = '#6B6B6B';

/** Matte floor, so it never competes with a model's reflections. */
const FLOOR_ROUGHNESS = 0.9;

/**
 * The floor sits this far below y = 0, so a model whose surface is exactly at y = 0 (the lane)
 * never z-fights with it.
 */
export const STAGE_FLOOR_DROP_M = 0.003;

export interface StageFloorOptions {
  /** Edge of the square floor, in metres. */
  readonly sizeM: number;
}

/** The catalogue's floor: a neutral grey square under the model. Not used by the game. */
export const createStageFloor: ModelFactory<StageFloorOptions> = (scene: Scene, { sizeM }): ModelHandle => {
  const root = new TransformNode('stage-floor', scene);
  const material = new PBRMaterial('stage-floor-material', scene);
  material.albedoColor = Color3.FromHexString(FLOOR_ALBEDO_HEX);
  material.metallic = 0;
  material.roughness = FLOOR_ROUGHNESS;
  const ground = CreateGround('stage-floor-ground', { width: sizeM, height: sizeM }, scene);
  ground.position.y = -STAGE_FLOOR_DROP_M;
  ground.material = material;
  ground.parent = root;
  return {
    root,
    dispose: () => {
      root.dispose(false, true);
      material.dispose();
    },
  };
};
