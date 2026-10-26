import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { perScene } from '../../materials/scene-cache';
import { RENTAL_SHOE_PLACEMENTS } from '../../measures/obstacles';
import type { ModelFactory, ModelHandle } from '../../model-handle';
import { createHeelLabel, createLacesMesh, heelLabelTexture } from './shoe-details';
import { createShoeMesh } from './shoe-mesh';

/** Smooth leather, a little worn: satin rather than gloss. */
const LEATHER_ROUGHNESS = 0.55;
const LACE_HEX = '#EFEDE6';
const LACE_ROUGHNESS = 0.85;

const leatherMaterial = perScene((scene: Scene) => {
  const material = new PBRMaterial('rental-shoe-leather', scene);
  material.albedoColor = Color3.White();
  material.metallic = 0;
  material.roughness = LEATHER_ROUGHNESS;
  // The collar is an opening: the inside of the walls must render too.
  material.backFaceCulling = false;
  material.twoSidedLighting = true;
  return material;
});

const laceMaterial = perScene((scene: Scene) => {
  const material = new PBRMaterial('rental-shoe-laces', scene);
  material.albedoColor = Color3.FromHexString(LACE_HEX);
  material.metallic = 0;
  material.roughness = LACE_ROUGHNESS;
  return material;
});

const labelMaterial = perScene((scene: Scene) => {
  const material = new PBRMaterial('rental-shoe-label', scene);
  material.albedoTexture = heelLabelTexture(scene);
  material.metallic = 0;
  material.roughness = LEATHER_ROUGHNESS;
  return material;
});

export type RentalShoesOptions = Readonly<Record<string, never>>;

/**
 * A pair of classic rental bowling shoes, side by side and slightly turned
 * (wiki/models/obstacles/rental-shoes.md). Root at the obstacle position on the lane surface.
 */
export const createRentalShoes: ModelFactory<RentalShoesOptions> = (scene: Scene): ModelHandle => {
  const root = new TransformNode('rental-shoes', scene);
  for (const placement of RENTAL_SHOE_PLACEMENTS) {
    const mirrored = placement.side === 'left';
    const shoe = new TransformNode(`rental-shoe-${placement.side}`, scene);
    shoe.position.set(placement.x, 0, placement.z);
    shoe.rotation.y = placement.yawRad;
    shoe.parent = root;
    const body = createShoeMesh(`rental-shoe-${placement.side}-body`, scene, mirrored);
    body.material = leatherMaterial(scene);
    const laces = createLacesMesh(`rental-shoe-${placement.side}-laces`, scene, mirrored);
    laces.material = laceMaterial(scene);
    const label = createHeelLabel(`rental-shoe-${placement.side}-label`, scene);
    label.material = labelMaterial(scene);
    for (const mesh of [body, laces, label]) mesh.parent = shoe;
  }
  return { root, dispose: () => root.dispose(false, false) };
};
