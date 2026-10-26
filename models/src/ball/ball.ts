import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { perScene } from '../materials/scene-cache';
import { BALL_RADIUS_M } from '../measures/ball';
import type { ModelFactory, ModelHandle } from '../model-handle';
import { createBallMesh } from './ball-geometry';
import { houseBallData, playerMarbleData, rawBallTexture } from './ball-textures';

/** Which ball: the player's, or the house ball of the returning-ball obstacle. */
export const BALL_VARIANTS = ['player', 'house'] as const;
export type BallVariant = (typeof BALL_VARIANTS)[number];

export interface BallOptions {
  readonly variant: BallVariant;
}

/** A ball handle also exposes `spin`, its centre: the run rotates it so ω = v / r (rule 4). */
export interface BallHandle extends ModelHandle {
  readonly spin: TransformNode;
}

/**
 * The grip (centred on the mesh's +y) is tilted towards -z, so at rest the holes face a viewer in
 * front of and above the ball; rolling turns it anyway. Radians about x.
 */
const GRIP_TILT_RAD = -1.1;

/** Seeds of the generated covers: one fixed look per variant, shared by every instance. */
const COVER_SEEDS: Readonly<Record<BallVariant, number>> = { player: 7, house: 11 };

/** Surface finish per variant: reactive resin is polished, the house ball is worn polyester. */
const FINISH: Readonly<Record<BallVariant, { roughness: number; clearCoat: number; clearCoatRoughness: number }>> = {
  player: { roughness: 0.25, clearCoat: 1, clearCoatRoughness: 0.04 },
  house: { roughness: 0.45, clearCoat: 0.5, clearCoatRoughness: 0.25 },
};

const material = (variant: BallVariant) =>
  perScene((scene: Scene) => {
    const data = variant === 'player' ? playerMarbleData(COVER_SEEDS.player) : houseBallData(COVER_SEEDS.house);
    const pbr = new PBRMaterial(`ball-${variant}`, scene);
    pbr.albedoTexture = rawBallTexture(`ball-${variant}-cover`, data, scene);
    pbr.albedoColor = Color3.White();
    pbr.metallic = 0;
    pbr.roughness = FINISH[variant].roughness;
    pbr.clearCoat.isEnabled = true;
    pbr.clearCoat.intensity = FINISH[variant].clearCoat;
    pbr.clearCoat.roughness = FINISH[variant].clearCoatRoughness;
    return pbr;
  });

const MATERIALS: Readonly<Record<BallVariant, (scene: Scene) => PBRMaterial>> = {
  player: material('player'),
  house: material('house'),
};

/** The bowling ball (wiki/models/ball.md). Root at the ground contact point, ball centre above it. */
export const createBall: ModelFactory<BallOptions, BallHandle> = (scene: Scene, { variant }): BallHandle => {
  const root = new TransformNode(`ball-${variant}`, scene);
  const spin = new TransformNode(`ball-${variant}-spin`, scene);
  spin.parent = root;
  spin.position.y = BALL_RADIUS_M;
  const mesh = createBallMesh(`ball-${variant}-mesh`, scene);
  mesh.material = MATERIALS[variant](scene);
  mesh.rotation.x = GRIP_TILT_RAD;
  mesh.bakeCurrentTransformIntoVertices();
  mesh.parent = spin;
  return {
    root,
    spin,
    dispose: () => root.dispose(false, false),
  };
};
