import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder';
// Side effect: Mesh.createInstance lives in this module (Babylon tree-shaking, AGENTS.md traps).
import '@babylonjs/core/Meshes/instancedMesh';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { perScene } from '../../materials/scene-cache';
import {
  SODA_CAN_COUNT,
  SODA_CAN_DIAMETER_M,
  SODA_CAN_HEIGHT_M,
  SODA_CAN_JITTER_M,
  SODA_CAN_LYING_SHARE,
  SODA_CAN_SPACING_M,
} from '../../measures/obstacles';
import type { ModelFactory, ModelHandle } from '../../model-handle';
import { seededRandom } from '../../procedural/seeded-random';

export interface SodaCansOptions {
  /** Seed of the offsets, turns and fallen cans, so rows along the track do not look copied. */
  readonly seed: number;
}

/** Where one can of the row stands, relative to the obstacle position, and how it lies. */
export interface SodaCanPlacement {
  readonly x: number;
  readonly z: number;
  readonly yawRad: number;
  readonly lying: boolean;
}

const RADIUS_M = SODA_CAN_DIAMETER_M / 2;
/** The can's shoulder and lid: the top 8 % of its height, a little narrower than the body (design). */
const LID_SHARE = 0.08;
const LID_RADIUS_SHARE = 0.86;
/** A white band round the middle, the only decoration of a can with no brand (design). */
const BAND_HEIGHT_SHARE = 0.22;
const BAND_CENTRE_SHARE = 0.55;
/** The band stands proud of the body by this share of the radius, so it never flickers into it. */
const BAND_LIFT = 1.01;
const TESSELLATION = 24;

const RED_HEX = '#C8102E';
const WHITE_HEX = '#F4F1EA';
const ALUMINIUM_HEX = '#C9CDD2';
/** Painted aluminium: a little metallic and shiny, like a can under the alley lights. */
const PAINT_METALLIC = 0.35;
const PAINT_ROUGHNESS = 0.3;
const BARE_METALLIC = 0.8;
const BARE_ROUGHNESS = 0.35;

const can = (name: string, hex: string, metallic: number, roughness: number) =>
  perScene((scene: Scene) => {
    const material = new PBRMaterial(name, scene);
    material.albedoColor = Color3.FromHexString(hex);
    material.metallic = metallic;
    material.roughness = roughness;
    return material;
  });
const redMaterial = can('soda-can-red', RED_HEX, PAINT_METALLIC, PAINT_ROUGHNESS);
const whiteMaterial = can('soda-can-white', WHITE_HEX, PAINT_METALLIC, PAINT_ROUGHNESS);
const aluminiumMaterial = can('soda-can-aluminium', ALUMINIUM_HEX, BARE_METALLIC, BARE_ROUGHNESS);

/** The row's cans: evenly spread across the surface, plus a seeded offset, turn and fall. */
export function sodaCanPlacements(seed: number): SodaCanPlacement[] {
  const random = seededRandom(seed);
  const jitter = (): number => (random() * 2 - 1) * SODA_CAN_JITTER_M;
  return Array.from({ length: SODA_CAN_COUNT }, (_, i) => ({
    x: (i - (SODA_CAN_COUNT - 1) / 2) * SODA_CAN_SPACING_M + jitter(),
    z: jitter(),
    yawRad: random() * 2 * Math.PI,
    lying: random() < SODA_CAN_LYING_SHARE,
  }));
}

/** One can standing on the origin: body, band and lid, three meshes to instance. */
function createCanParts(scene: Scene): Mesh[] {
  const bodyHeight = SODA_CAN_HEIGHT_M * (1 - LID_SHARE);
  const body = CreateCylinder('soda-can-body', { height: bodyHeight, diameter: SODA_CAN_DIAMETER_M, tessellation: TESSELLATION }, scene);
  body.position.y = bodyHeight / 2;
  body.material = redMaterial(scene);
  const band = CreateCylinder('soda-can-band', { height: SODA_CAN_HEIGHT_M * BAND_HEIGHT_SHARE, diameter: SODA_CAN_DIAMETER_M * BAND_LIFT, tessellation: TESSELLATION }, scene);
  band.position.y = SODA_CAN_HEIGHT_M * BAND_CENTRE_SHARE;
  band.material = whiteMaterial(scene);
  const lid = CreateCylinder('soda-can-lid', { height: SODA_CAN_HEIGHT_M * LID_SHARE, diameterTop: 2 * RADIUS_M * LID_RADIUS_SHARE, diameterBottom: SODA_CAN_DIAMETER_M, tessellation: TESSELLATION }, scene);
  lid.position.y = bodyHeight + (SODA_CAN_HEIGHT_M * LID_SHARE) / 2;
  lid.material = aluminiumMaterial(scene);
  return [body, band, lid];
}

/**
 * A row of drink cans spilled across the whole playing surface (wiki/models/obstacles/soda-cans.md):
 * some standing, some rolled on their side. Low enough to jump, too wide to go round. The cans are
 * instances of one can. Root at the obstacle position on the lane centre line.
 */
export const createSodaCans: ModelFactory<SodaCansOptions> = (scene: Scene, { seed }): ModelHandle => {
  const root = new TransformNode('soda-cans', scene);
  const template = new TransformNode('soda-can', scene);
  template.parent = root;
  template.setEnabled(false);
  const parts = createCanParts(scene);
  for (const part of parts) part.parent = template;
  sodaCanPlacements(seed).forEach((placement, i) => {
    const placed = new TransformNode(`soda-can-${i}`, scene);
    placed.parent = root;
    placed.position.set(placement.x, placement.lying ? RADIUS_M : 0, placement.z);
    placed.rotation.y = placement.yawRad;
    const tilt = new TransformNode(`soda-can-${i}-tilt`, scene);
    tilt.parent = placed;
    // A lying can rests on its side: its axis turned flat, its middle on the axis of the turn.
    if (placement.lying) {
      tilt.rotation.z = Math.PI / 2;
      tilt.position.x = SODA_CAN_HEIGHT_M / 2;
    }
    for (const part of parts) {
      const instance = part.createInstance(`soda-can-${i}-${part.name}`);
      instance.parent = tilt;
      // An instance keeps its own transform: it starts where the part sits in the can.
      instance.position.copyFrom(part.position);
    }
  });
  return { root, dispose: () => root.dispose(false, false) };
};
