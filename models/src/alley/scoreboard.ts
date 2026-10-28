import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { perScene } from '../materials/scene-cache';
import { SCOREBOARD_BEZEL_M, SCOREBOARD_BOTTOM_M, SCOREBOARD_HEIGHT_M } from '../measures/alley';
import type { ModelFactory, ModelHandle } from '../model-handle';
import { drawLiveScreen, drawWaitingScreen, type CanvasSize } from './scoreboard-canvas';
import { scoreboardScreens, type ScoreboardContent, type ScoreboardScreen } from './scoreboard-layout';
import { SCENERY_THEMES, type Scenery } from './scenery-themes';

export interface ScoreboardOptions {
  readonly scenery: Scenery;
  /** What the live screen shows first; the game then calls `show` as the run goes. */
  readonly content: ScoreboardContent;
}

export interface ScoreboardHandle extends ModelHandle {
  /** Redraws the live screen. */
  show(content: ScoreboardContent): void;
}

/** Texture pixels per metre of screen (design: sharp from the deck camera, light on memory). */
const PIXELS_PER_M = 280;
const BEZEL_HEX = '#050507';
/** The bezel's depth behind the screen's face. */
const BEZEL_DEPTH_M = 0.06;
/** The screen's face stands this far in front of its bezel. */
const FACE_LIFT_M = 0.004;

const bezelMaterial = perScene((scene: Scene) => {
  const material = new PBRMaterial('scoreboard-bezel', scene);
  material.albedoColor = Color3.FromHexString(BEZEL_HEX);
  material.metallic = 0;
  material.roughness = 0.4;
  return material;
});

/** One screen: a bezel, and a face lit by its own picture (unlit: a screen shines whatever the room). */
function createScreen(scene: Scene, screen: ScoreboardScreen): { node: TransformNode; texture: DynamicTexture; size: CanvasSize } {
  const node = new TransformNode(`scoreboard-${screen.laneNumber}`, scene);
  node.position.set(screen.centreX, SCOREBOARD_BOTTOM_M + SCOREBOARD_HEIGHT_M / 2, 0);
  const bezel = CreateBox(`scoreboard-${screen.laneNumber}-bezel`, { width: screen.widthM, height: SCOREBOARD_HEIGHT_M, depth: BEZEL_DEPTH_M }, scene);
  bezel.position.z = BEZEL_DEPTH_M / 2;
  bezel.material = bezelMaterial(scene);
  bezel.parent = node;
  const faceWidth = screen.widthM - 2 * SCOREBOARD_BEZEL_M;
  const faceHeight = SCOREBOARD_HEIGHT_M - 2 * SCOREBOARD_BEZEL_M;
  const size = { width: Math.round(faceWidth * PIXELS_PER_M), height: Math.round(faceHeight * PIXELS_PER_M) };
  const texture = new DynamicTexture(`scoreboard-${screen.laneNumber}-picture`, size, scene, true);
  const material = new PBRMaterial(`scoreboard-${screen.laneNumber}-face`, scene);
  material.unlit = true;
  material.albedoTexture = texture;
  const face = CreatePlane(`scoreboard-${screen.laneNumber}-face`, { width: faceWidth, height: faceHeight }, scene);
  face.position.z = -FACE_LIFT_M;
  face.material = material;
  face.parent = node;
  return { node, texture, size };
}

/**
 * The scoreboard over the pins (wiki/models/lane.md, rule 6): a screen over each lane, the middle
 * one live — who plays, the impacts, the score and the ten pins — the others waiting for players
 * with their lane number. Root on the lane centre line at the end wall, screens facing the ball (−z).
 */
export const createScoreboard: ModelFactory<ScoreboardOptions, ScoreboardHandle> = (scene: Scene, { scenery, content }): ScoreboardHandle => {
  const theme = SCENERY_THEMES[scenery];
  const root = new TransformNode('scoreboard', scene);
  let redraw: (next: ScoreboardContent) => void = () => {};
  for (const screen of scoreboardScreens()) {
    const { node, texture, size } = createScreen(scene, screen);
    node.parent = root;
    const ctx = texture.getContext();
    if (screen.live) {
      redraw = (next) => {
        drawLiveScreen(ctx, size, theme, next);
        texture.update();
      };
    } else {
      drawWaitingScreen(ctx, size, theme, screen.laneNumber);
      texture.update();
    }
  }
  redraw(content);
  return { root, show: redraw, dispose: () => root.dispose(false, true) };
};
