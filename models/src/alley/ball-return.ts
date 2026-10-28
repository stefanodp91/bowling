import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { perScene } from '../materials/scene-cache';
import {
  BALL_RETURN_BALLS,
  BALL_RETURN_HOOD_HEIGHT_M,
  BALL_RETURN_HOOD_LENGTH_M,
  BALL_RETURN_HOOD_WIDTH_M,
  BALL_RETURN_RACK_LENGTH_M,
  BALL_RETURN_RAIL_GAP_M,
  BALL_RETURN_RAIL_HEIGHT_M,
} from '../measures/alley';
import { BALL_DIAMETER_M, BALL_RADIUS_M } from '../measures/ball';
import { PROP_SCALE } from '../measures/scale';
import type { ModelFactory, ModelHandle } from '../model-handle';
import { SCENERY_THEMES, type Scenery } from './scenery-themes';

export interface BallReturnOptions {
  /** The room's theme: the hood takes its colours, the rails its neon. */
  readonly scenery: Scenery;
}

/** The house balls on the rack, each its own colour, the nearest first (design). */
const BALL_HEXES = ['#F2C14E', '#F28C28', '#D7263D', '#7DC95E', '#2F6FD6', '#C2338A'] as const;
const OPENING_HEX = '#060608';
const RAIL_HEX = '#B9BEC6';
/** Rails, legs and the light strip under the rack, × PROP_SCALE like the machine (design). */
const RAIL_DIAMETER_M = 0.03 * PROP_SCALE;
const LEG_SECTION_M = 0.05 * PROP_SCALE;
const STRIP_HEIGHT_M = 0.015 * PROP_SCALE;
/** The opening in the hood's face the balls roll out of: a share of the hood's width (design). */
const OPENING_SHARE = 0.8;
const OPENING_DEPTH_M = 0.01;
const TESSELLATION = 32;
/** Balls on the rack touch, with this much air between them (design). */
const BALL_GAP_M = 0.01;
/** How strongly the light strip glows, as a share of its colour (design). */
const GLOW = 0.9;
const PAINT_ROUGHNESS = 0.35;
const BALL_ROUGHNESS = 0.15;
const RAIL_METALLIC = 0.8;
const RAIL_ROUGHNESS = 0.3;

const plain = (name: string, hex: string, roughness: number, metallic = 0) => {
  return (scene: Scene): PBRMaterial => {
    const material = new PBRMaterial(name, scene);
    material.albedoColor = Color3.FromHexString(hex);
    material.metallic = metallic;
    material.roughness = roughness;
    return material;
  };
};
const ballMaterials = BALL_HEXES.map((hex, i) =>
  perScene((scene: Scene) => {
    const material = plain(`ball-return-ball-${i}`, hex, BALL_ROUGHNESS)(scene);
    material.clearCoat.isEnabled = true;
    return material;
  }),
);
const railMaterial = perScene(plain('ball-return-rail', RAIL_HEX, RAIL_ROUGHNESS, RAIL_METALLIC));
const openingMaterial = perScene(plain('ball-return-opening', OPENING_HEX, PAINT_ROUGHNESS));

/** The hood: a box with a rounded top, painted in the theme, and the dark opening on its face. */
function createHood(scene: Scene, scenery: Scenery): Mesh[] {
  const theme = SCENERY_THEMES[scenery].surfaces;
  const paint = plain(`ball-return-hood-${scenery}`, theme.topBand, PAINT_ROUGHNESS)(scene);
  const radius = BALL_RETURN_HOOD_WIDTH_M / 2;
  const bodyHeight = BALL_RETURN_HOOD_HEIGHT_M - radius;
  const body = CreateBox('ball-return-hood', { width: BALL_RETURN_HOOD_WIDTH_M, height: bodyHeight, depth: BALL_RETURN_HOOD_LENGTH_M }, scene);
  body.position.set(0, bodyHeight / 2, BALL_RETURN_HOOD_LENGTH_M / 2);
  const top = CreateCylinder('ball-return-hood-top', { height: BALL_RETURN_HOOD_LENGTH_M, diameter: BALL_RETURN_HOOD_WIDTH_M, tessellation: TESSELLATION }, scene);
  top.rotation.x = Math.PI / 2;
  top.position.set(0, bodyHeight, BALL_RETURN_HOOD_LENGTH_M / 2);
  const opening = CreateCylinder('ball-return-opening', { height: OPENING_DEPTH_M, diameter: BALL_RETURN_HOOD_WIDTH_M * OPENING_SHARE, tessellation: TESSELLATION }, scene);
  opening.rotation.x = Math.PI / 2;
  opening.position.set(0, BALL_RETURN_RAIL_HEIGHT_M + BALL_RADIUS_M, -OPENING_DEPTH_M / 2);
  for (const mesh of [body, top]) mesh.material = paint;
  opening.material = openingMaterial(scene);
  return [body, top, opening];
}

/** The rack: two rails from the hood towards the bowler, a leg at its end, a glowing strip under it. */
function createRack(scene: Scene, scenery: Scenery): Mesh[] {
  const meshes: Mesh[] = [];
  for (const side of [-1, 1]) {
    const rail = CreateCylinder('ball-return-rail', { height: BALL_RETURN_RACK_LENGTH_M, diameter: RAIL_DIAMETER_M, tessellation: TESSELLATION / 2 }, scene);
    rail.rotation.x = Math.PI / 2;
    rail.position.set((side * BALL_RETURN_RAIL_GAP_M) / 2, BALL_RETURN_RAIL_HEIGHT_M, -BALL_RETURN_RACK_LENGTH_M / 2);
    rail.material = railMaterial(scene);
    meshes.push(rail);
  }
  const leg = CreateBox('ball-return-leg', { width: LEG_SECTION_M, height: BALL_RETURN_RAIL_HEIGHT_M, depth: LEG_SECTION_M }, scene);
  leg.position.set(0, BALL_RETURN_RAIL_HEIGHT_M / 2, -BALL_RETURN_RACK_LENGTH_M + LEG_SECTION_M);
  leg.material = railMaterial(scene);
  const strip = CreateBox('ball-return-strip', { width: BALL_RETURN_RAIL_GAP_M, height: STRIP_HEIGHT_M, depth: BALL_RETURN_RACK_LENGTH_M }, scene);
  strip.position.set(0, BALL_RETURN_RAIL_HEIGHT_M - RAIL_DIAMETER_M, -BALL_RETURN_RACK_LENGTH_M / 2);
  const glow = plain(`ball-return-strip-${scenery}`, SCENERY_THEMES[scenery].surfaces.neon, PAINT_ROUGHNESS)(scene);
  glow.emissiveColor = Color3.FromHexString(SCENERY_THEMES[scenery].surfaces.neon).scale(GLOW);
  strip.material = glow;
  return [...meshes, leg, strip];
}

/** The balls waiting on the rails: each sits on both rails, its centre above their line. */
function createRackBalls(scene: Scene): Mesh[] {
  const centreY = BALL_RETURN_RAIL_HEIGHT_M + Math.sqrt(BALL_RADIUS_M ** 2 - (BALL_RETURN_RAIL_GAP_M / 2) ** 2);
  return Array.from({ length: BALL_RETURN_BALLS }, (_, i) => {
    const ball = CreateSphere(`ball-return-ball-${i}`, { diameter: BALL_DIAMETER_M, segments: TESSELLATION }, scene);
    ball.position.set(0, centreY, -(i + 0.5) * (BALL_DIAMETER_M + BALL_GAP_M));
    const material = ballMaterials[i % ballMaterials.length];
    if (material !== undefined) ball.material = material(scene);
    return ball;
  });
}

/**
 * The ball return at the start of the lanes (wiki/models/lane.md, rule 6): the hood the balls come
 * back up through, painted in the room's theme, and the rack that brings them to the bowler, with
 * its glowing strip and six coloured house balls. Root on the floor at the hood's face; the hood
 * runs along +z towards the pins, the rack along −z towards the bowler.
 */
export const createBallReturn: ModelFactory<BallReturnOptions> = (scene: Scene, { scenery }): ModelHandle => {
  const root = new TransformNode('ball-return', scene);
  const hood = createHood(scene, scenery);
  const rack = createRack(scene, scenery);
  for (const mesh of [...hood, ...rack, ...createRackBalls(scene)]) mesh.parent = root;
  // The theme's paint and glow belong to this machine alone; the shared materials stay with the scene.
  const own = [hood[0]?.material, rack[rack.length - 1]?.material];
  return {
    root,
    dispose: () => {
      root.dispose(false, false);
      for (const material of own) material?.dispose();
    },
  };
};
