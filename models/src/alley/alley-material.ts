import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import type { Scene } from '@babylonjs/core/scene';
import { perScene } from '../materials/scene-cache';

/**
 * The scenery is unlit: its colours are painted into the vertices, so the room reads the same
 * everywhere along the lane without lights of its own, and each piece costs one draw call
 * (wiki/models/lane.md, rule 6).
 */
export const decorMaterial = perScene((scene: Scene) => {
  const material = new PBRMaterial('alley-decor', scene);
  material.unlit = true;
  material.albedoColor = Color3.White();
  material.backFaceCulling = false;
  return material;
});
