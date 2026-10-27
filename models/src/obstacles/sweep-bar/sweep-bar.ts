import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { perScene } from '../../materials/scene-cache';
import { PLAYING_SURFACE_WIDTH_M } from '../../measures/lane';
import {
  SWEEP_BAR_HEIGHT_M,
  SWEEP_BOARD_THICKNESS_M,
  SWEEP_LIP_DEPTH_M,
  SWEEP_OVERHANG_M,
  SWEEP_PIVOT_HEIGHT_M,
  SWEEP_SWING_ANGLE_RAD,
} from '../../measures/obstacles';
import { PROP_SCALE } from '../../measures/scale';
import type { ModelFactory, ModelHandle } from '../../model-handle';

export interface SweepBarOptions {
  /** Seconds for one full back-and-forth swing (a tunable of the game). */
  readonly swingPeriodS: number;
}

/** The board spans the lane, which is not scaled; every other length here is × PROP_SCALE, like the props. */
const BOARD_WIDTH_M = PLAYING_SURFACE_WIDTH_M + 2 * SWEEP_OVERHANG_M;
/** A painted stripe along the board face: its height and how high its centre sits. */
const STRIPE_HEIGHT_M = 0.05 * PROP_SCALE;
const STRIPE_CENTRE_M = 0.2 * PROP_SCALE;
const STRIPE_DEPTH_M = 0.004 * PROP_SCALE;
/** Folded top lip of the board: its height (its depth is SWEEP_LIP_DEPTH_M). */
const LIP_HEIGHT_M = 0.025 * PROP_SCALE;
/** Arms: square steel tubes from the board ends up to the pivots; the header beam joins them. */
const ARM_SECTION_M = 0.05 * PROP_SCALE;
const HEADER_SECTION_M = 0.08 * PROP_SCALE;
const PIVOT_RADIUS_M = 0.05 * PROP_SCALE;
const PIVOT_LENGTH_M = 0.12 * PROP_SCALE;
const PIVOT_TESSELLATION = 16;

/** The pinsetter's underside the arms hang from: a painted housing across the lane. */
const HOUSING_DEPTH_M = 0.6 * PROP_SCALE;
const HOUSING_HEIGHT_M = 0.28 * PROP_SCALE;
const HAZARD_HEIGHT_M = 0.06 * PROP_SCALE;
const HAZARD_STRIPES = 24;
/** A crank plate on each pivot shaft, as on the real sweep drive. */
const CRANK_RADIUS_M = 0.11 * PROP_SCALE;
const CRANK_THICKNESS_M = 0.02 * PROP_SCALE;

const BOARD_HEX = '#B3261E';
const HOUSING_HEX = '#2B2E33';
const HAZARD_YELLOW_HEX = '#E8B21A';
const HAZARD_BLACK_HEX = '#151515';
const STRIPE_HEX = '#F2EEE3';
const STEEL_HEX = '#A7ADB4';
const PAINT_ROUGHNESS = 0.38;
const STEEL_ROUGHNESS = 0.45;
/** Painted steel: partly metallic, so it does not mirror the dark alley into black. */
const STEEL_METALLIC = 0.4;

const painted = (name: string, hex: string) =>
  perScene((scene: Scene) => {
    const material = new PBRMaterial(name, scene);
    material.albedoColor = Color3.FromHexString(hex);
    material.metallic = 0;
    material.roughness = PAINT_ROUGHNESS;
    material.clearCoat.isEnabled = true;
    return material;
  });

const boardMaterial = painted('sweep-board', BOARD_HEX);
const stripeMaterial = painted('sweep-stripe', STRIPE_HEX);
const housingMaterial = painted('sweep-housing', HOUSING_HEX);
const hazardYellow = painted('sweep-hazard-yellow', HAZARD_YELLOW_HEX);
const hazardBlack = painted('sweep-hazard-black', HAZARD_BLACK_HEX);
const steelMaterial = perScene((scene: Scene) => {
  const material = new PBRMaterial('sweep-steel', scene);
  material.albedoColor = Color3.FromHexString(STEEL_HEX);
  material.metallic = STEEL_METALLIC;
  material.roughness = STEEL_ROUGHNESS;
  return material;
});


/**
 * The pinsetter's sweep across the whole playing surface (wiki/models/obstacles/sweep-bar.md): a
 * painted guard board hanging from two arms, swinging gently along z like a pendulum. Root at the
 * obstacle position on the lane surface.
 */
export const createSweepBar: ModelFactory<SweepBarOptions> = (scene: Scene, { swingPeriodS }): ModelHandle => {
  const root = new TransformNode('sweep-bar', scene);
  const pendulum = new TransformNode('sweep-bar-pendulum', scene);
  pendulum.position.y = SWEEP_PIVOT_HEIGHT_M;
  pendulum.parent = root;
  const hang = (y: number): number => y - SWEEP_PIVOT_HEIGHT_M;

  const board = CreateBox('sweep-board', { width: BOARD_WIDTH_M, height: SWEEP_BAR_HEIGHT_M - LIP_HEIGHT_M, depth: SWEEP_BOARD_THICKNESS_M }, scene);
  board.position.y = hang((SWEEP_BAR_HEIGHT_M - LIP_HEIGHT_M) / 2);
  board.material = boardMaterial(scene);
  const lip = CreateBox('sweep-lip', { width: BOARD_WIDTH_M, height: LIP_HEIGHT_M, depth: SWEEP_LIP_DEPTH_M }, scene);
  lip.position.y = hang(SWEEP_BAR_HEIGHT_M - LIP_HEIGHT_M / 2);
  lip.material = steelMaterial(scene);
  const stripes = [-1, 1].map((face) => {
    const stripe = CreateBox(`sweep-stripe-${face}`, { width: BOARD_WIDTH_M * 0.98, height: STRIPE_HEIGHT_M, depth: STRIPE_DEPTH_M }, scene);
    stripe.position.set(0, hang(STRIPE_CENTRE_M), face * (SWEEP_BOARD_THICKNESS_M / 2));
    stripe.material = stripeMaterial(scene);
    return stripe;
  });
  const armLength = SWEEP_PIVOT_HEIGHT_M - SWEEP_BAR_HEIGHT_M;
  const steel = [-1, 1].flatMap((side) => {
    const x = side * (BOARD_WIDTH_M / 2 - ARM_SECTION_M / 2);
    const arm = CreateBox(`sweep-arm-${side}`, { width: ARM_SECTION_M, height: armLength, depth: ARM_SECTION_M }, scene);
    arm.position.set(x, hang(SWEEP_BAR_HEIGHT_M + armLength / 2), 0);
    const pivot = CreateCylinder(`sweep-pivot-${side}`, { diameter: 2 * PIVOT_RADIUS_M, height: PIVOT_LENGTH_M, tessellation: PIVOT_TESSELLATION }, scene);
    pivot.rotation.z = Math.PI / 2;
    pivot.position.set(x, 0, 0);
    const crank = CreateCylinder(`sweep-crank-${side}`, { diameter: 2 * CRANK_RADIUS_M, height: CRANK_THICKNESS_M, tessellation: PIVOT_TESSELLATION }, scene);
    crank.rotation.z = Math.PI / 2;
    crank.position.set(x - side * (ARM_SECTION_M / 2 + CRANK_THICKNESS_M / 2), 0, 0);
    return [arm, pivot, crank];
  });
  const header = CreateBox('sweep-header', { width: BOARD_WIDTH_M, height: HEADER_SECTION_M, depth: HEADER_SECTION_M }, scene);
  for (const mesh of [lip, ...steel, header]) mesh.material = steelMaterial(scene);
  for (const mesh of [board, lip, ...stripes, ...steel, header]) mesh.parent = pendulum;

  const housing = CreateBox('sweep-housing', { width: BOARD_WIDTH_M, height: HOUSING_HEIGHT_M, depth: HOUSING_DEPTH_M }, scene);
  housing.position.y = SWEEP_PIVOT_HEIGHT_M + HEADER_SECTION_M / 2 + HOUSING_HEIGHT_M / 2;
  housing.material = housingMaterial(scene);
  housing.parent = root;
  const stripeWidth = BOARD_WIDTH_M / HAZARD_STRIPES;
  for (let i = 0; i < HAZARD_STRIPES; i += 1) {
    const band = CreateBox(`sweep-hazard-${i}`, { width: stripeWidth, height: HAZARD_HEIGHT_M, depth: STRIPE_DEPTH_M }, scene);
    band.position.set(-BOARD_WIDTH_M / 2 + stripeWidth * (i + 0.5), housing.position.y - HOUSING_HEIGHT_M / 2 + HAZARD_HEIGHT_M / 2, -HOUSING_DEPTH_M / 2 - STRIPE_DEPTH_M / 2);
    band.material = i % 2 === 0 ? hazardYellow(scene) : hazardBlack(scene);
    band.parent = root;
  }

  return {
    root,
    animate: (elapsedS) => {
      pendulum.rotation.x = SWEEP_SWING_ANGLE_RAD * Math.sin((2 * Math.PI * elapsedS) / swingPeriodS);
    },
    dispose: () => root.dispose(false, false),
  };
};
