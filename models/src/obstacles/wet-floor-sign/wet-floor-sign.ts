import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { CreateDisc } from '@babylonjs/core/Meshes/Builders/discBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { perScene } from '../../materials/scene-cache';
import { WET_FLOOR_SIGN_HEIGHT_M, WET_FLOOR_SIGN_SPREAD_M, WET_FLOOR_SIGN_WIDTH_M } from '../../measures/obstacles';
import { PROP_SCALE } from '../../measures/scale';
import type { ModelFactory, ModelHandle } from '../../model-handle';

export type WetFloorSignOptions = Readonly<Record<string, never>>;

/** Each panel runs from a foot on the lane to the hinge at the top. */
const PANEL_LENGTH_M = Math.hypot(WET_FLOOR_SIGN_HEIGHT_M, WET_FLOOR_SIGN_SPREAD_M / 2);
/** How far each panel leans from vertical. */
const PANEL_TILT_RAD = Math.atan2(WET_FLOOR_SIGN_SPREAD_M / 2, WET_FLOOR_SIGN_HEIGHT_M);
/** Moulded plastic panel thickness (design), × PROP_SCALE like every length of a prop. */
const PANEL_THICKNESS_M = 0.012 * PROP_SCALE;
/** The black band across the top of each panel, where the handle is (design). */
const BAND_HEIGHT_M = 0.07 * PROP_SCALE;
/** The warning pictogram: a black triangle with a yellow inside and a black exclamation mark. */
const TRIANGLE_RADIUS_M = 0.11 * PROP_SCALE;
const TRIANGLE_INNER_SHARE = 0.72;
/** Where the pictogram's centre sits along the panel, as a share of its length from the foot. */
const PICTOGRAM_AT_SHARE = 0.55;
const BAR_WIDTH_M = 0.016 * PROP_SCALE;
const BAR_HEIGHT_M = 0.05 * PROP_SCALE;
const DOT_SIZE_M = 0.016 * PROP_SCALE;
/** Gap between the bar and the dot of the exclamation mark. */
const DOT_GAP_M = 0.012 * PROP_SCALE;
/** Details stand this far off the panel face, so they never fight with it. */
const LIFT_M = 0.002 * PROP_SCALE;
const TRIANGLE_SIDES = 3;

const YELLOW_HEX = '#F2C318';
const BLACK_HEX = '#1A1A1A';
const PLASTIC_ROUGHNESS = 0.5;

const plastic = (name: string, hex: string) =>
  perScene((scene: Scene) => {
    const material = new PBRMaterial(name, scene);
    material.albedoColor = Color3.FromHexString(hex);
    material.metallic = 0;
    material.roughness = PLASTIC_ROUGHNESS;
    return material;
  });
const yellowMaterial = plastic('wet-floor-yellow', YELLOW_HEX);
const blackMaterial = plastic('wet-floor-black', BLACK_HEX);

/** A triangle pointing up, facing −z, in the panel's plane. */
function triangle(name: string, radius: number, scene: Scene): Mesh {
  const disc = CreateDisc(name, { radius, tessellation: TRIANGLE_SIDES, sideOrientation: Mesh.DOUBLESIDE }, scene);
  disc.rotation.z = Math.PI / 2;
  return disc;
}

/**
 * One panel with its band and pictogram on the outer face. The panel's local −z is its outer face;
 * local y runs from the foot (0) to the hinge.
 */
function createPanel(name: string, scene: Scene): TransformNode {
  const panel = new TransformNode(name, scene);
  const board = CreateBox(`${name}-board`, { width: WET_FLOOR_SIGN_WIDTH_M, height: PANEL_LENGTH_M, depth: PANEL_THICKNESS_M }, scene);
  board.position.y = PANEL_LENGTH_M / 2;
  board.material = yellowMaterial(scene);
  const face = -PANEL_THICKNESS_M / 2 - LIFT_M;
  const band = CreateBox(`${name}-band`, { width: WET_FLOOR_SIGN_WIDTH_M, height: BAND_HEIGHT_M, depth: PANEL_THICKNESS_M + 2 * LIFT_M }, scene);
  band.position.y = PANEL_LENGTH_M - BAND_HEIGHT_M / 2;
  band.material = blackMaterial(scene);
  const centreY = PANEL_LENGTH_M * PICTOGRAM_AT_SHARE;
  const outer = triangle(`${name}-triangle`, TRIANGLE_RADIUS_M, scene);
  outer.position.set(0, centreY, face);
  outer.material = blackMaterial(scene);
  const inner = triangle(`${name}-triangle-inner`, TRIANGLE_RADIUS_M * TRIANGLE_INNER_SHARE, scene);
  inner.position.set(0, centreY, face - LIFT_M);
  inner.material = yellowMaterial(scene);
  const bar = CreateBox(`${name}-bar`, { width: BAR_WIDTH_M, height: BAR_HEIGHT_M, depth: LIFT_M }, scene);
  bar.position.set(0, centreY + DOT_GAP_M / 2 + DOT_SIZE_M / 2, face - 2 * LIFT_M);
  bar.material = blackMaterial(scene);
  const dot = CreateBox(`${name}-dot`, { width: DOT_SIZE_M, height: DOT_SIZE_M, depth: LIFT_M }, scene);
  dot.position.set(0, centreY - BAR_HEIGHT_M / 2 - DOT_GAP_M / 2, face - 2 * LIFT_M);
  dot.material = blackMaterial(scene);
  for (const mesh of [board, band, outer, inner, bar, dot]) mesh.parent = panel;
  return panel;
}

/**
 * A yellow folding «wet floor» sign standing open in one travel lane
 * (wiki/models/obstacles/wet-floor-sign.md): two panels hinged at the top, one facing the
 * approaching ball with a warning pictogram. Taller than the jump: go round it. Root at the
 * obstacle position on the lane surface, centred between the feet.
 */
export const createWetFloorSign: ModelFactory<WetFloorSignOptions> = (scene: Scene): ModelHandle => {
  const root = new TransformNode('wet-floor-sign', scene);
  // The front panel's foot is towards the ball (−z), its top leans back to the hinge; the back one mirrors it.
  for (const side of [-1, 1] as const) {
    const panel = createPanel(side < 0 ? 'wet-floor-front' : 'wet-floor-back', scene);
    panel.parent = root;
    panel.position.z = (side * WET_FLOOR_SIGN_SPREAD_M) / 2;
    // Pitch comes before yaw: the back panel, turned half round, leans with the same pitch.
    panel.rotation.x = PANEL_TILT_RAD;
    if (side > 0) panel.rotation.y = Math.PI;
  }
  return { root, dispose: () => root.dispose(false, false) };
};
