import type { Scene } from '@babylonjs/core/scene';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { ModelFactory, ModelHandle } from '../model-handle';

/** Edge of the placeholder cube, in metres: a unit cube (wiki/storybook/catalog.md, criterion 1). */
export const PLACEHOLDER_EDGE_M = 1;

/** Albedo of the placeholder: a saturated orange, chosen to stand out from any neutral background. */
const PLACEHOLDER_ALBEDO_HEX = '#E8742A';

/** Roughness of the placeholder (0 mirror, 1 matte): a matte plastic, design choice. */
const PLACEHOLDER_ROUGHNESS = 0.6;

/** Options of the placeholder model: it has none. */
export type PlaceholderOptions = Readonly<Record<string, never>>;

/** A unit cube resting on the ground, used until the first real model exists. */
export const createPlaceholder: ModelFactory<PlaceholderOptions> = (scene: Scene): ModelHandle => {
  const root = new TransformNode('placeholder', scene);
  const material = new PBRMaterial('placeholder-material', scene);
  material.albedoColor = Color3.FromHexString(PLACEHOLDER_ALBEDO_HEX);
  material.metallic = 0;
  material.roughness = PLACEHOLDER_ROUGHNESS;
  const cube = CreateBox('placeholder-cube', { size: PLACEHOLDER_EDGE_M }, scene);
  cube.position.y = PLACEHOLDER_EDGE_M / 2;
  cube.material = material;
  cube.parent = root;
  return {
    root,
    dispose: () => {
      root.dispose(false, true);
      material.dispose();
    },
  };
};
