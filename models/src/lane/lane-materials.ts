import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import type { Scene } from '@babylonjs/core/scene';
import { perScene } from '../materials/scene-cache';
import { createBoardTexture } from './board-texture';

/**
 * Lane materials, one per scene. The boards are oiled maple under a lacquer: a glossy clear coat
 * over a fairly smooth base (wiki/models/lane.md, rule 2).
 */
const BOARD_ROUGHNESS = 0.35;
const OIL_CLEAR_COAT = 0.9;
const OIL_CLEAR_COAT_ROUGHNESS = 0.06;

export const boardMaterial = perScene((scene: Scene) => {
  const material = new PBRMaterial('lane-boards', scene);
  material.albedoTexture = createBoardTexture(scene);
  material.metallic = 0;
  material.roughness = BOARD_ROUGHNESS;
  material.clearCoat.isEnabled = true;
  material.clearCoat.intensity = OIL_CLEAR_COAT;
  material.clearCoat.roughness = OIL_CLEAR_COAT_ROUGHNESS;
  return material;
});

/** Gutters: moulded dark grey plastic, satin (modern synthetic lanes). */
const GUTTER_HEX = '#2A2B30';
const GUTTER_ROUGHNESS = 0.45;

export const gutterMaterial = perScene((scene: Scene) => {
  const material = new PBRMaterial('lane-gutter', scene);
  material.albedoColor = Color3.FromHexString(GUTTER_HEX);
  material.metallic = 0;
  material.roughness = GUTTER_ROUGHNESS;
  return material;
});

/** Markings (foul line, dots, arrows): dark inlay, matte, under the same lacquer as the boards. */
const MARKING_HEX = '#3B1E12';
const MARKING_ROUGHNESS = 0.4;

export const markingMaterial = perScene((scene: Scene) => {
  const material = new PBRMaterial('lane-markings', scene);
  material.albedoColor = Color3.FromHexString(MARKING_HEX);
  material.metallic = 0;
  material.roughness = MARKING_ROUGHNESS;
  return material;
});
