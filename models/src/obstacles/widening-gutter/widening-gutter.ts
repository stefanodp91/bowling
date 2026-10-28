import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { GUTTER_DEPTH_M, GUTTER_WIDTH_M, laneCentreX, TRAVEL_LANE_WIDTH_M, type LaneIndex } from '../../measures/lane';
import { GUTTER_RAMP_M } from '../../measures/obstacles';
import type { ModelFactory, ModelHandle } from '../../model-handle';
import { openBoardHole } from '../../lane/board-holes';
import { gutterMaterial } from '../../lane/lane-materials';
import { createTroughMesh } from '../../lane/trough-geometry';

export interface WideningGutterOptions {
  /** Length of the full-depth channel, metres (the track's lengthM). */
  readonly lengthM: number;
  readonly lane: LaneIndex;
}

/**
 * The outer gutters' section scaled to a whole travel lane: same shape, so the depth grows with the
 * width (0.048 m × 1.054 / 0.235 ≈ 0.21 m). A 48 mm dip one lane wide would read as a flat strip.
 */
const CHANNEL_DEPTH_M = GUTTER_DEPTH_M * (TRAVEL_LANE_WIDTH_M / GUTTER_WIDTH_M);

/** Rings per metre of the channel: enough for the ramps to read as smooth slopes. */
const RINGS_PER_M = 4;

/**
 * One travel lane turned into a gutter channel (wiki/models/obstacles/widening-gutter.md): the
 * outer gutters' rounded section, one lane wide, full depth over [0, lengthM] and ramping open
 * and closed over GUTTER_RAMP_M at each end. It opens a hole in the lane boards above it, so it
 * replaces them exactly. Root on the lane's centre line at the start of the full-depth channel; the
 * factory sets root x from `lane`, the scene sets z.
 */
export const createWideningGutter: ModelFactory<WideningGutterOptions> = (scene: Scene, { lengthM, lane }): ModelHandle => {
  const root = new TransformNode('widening-gutter', scene);
  root.position.x = laneCentreX(lane);
  const totalM = lengthM + 2 * GUTTER_RAMP_M;
  const rampFraction = GUTTER_RAMP_M / totalM;
  const channel = createTroughMesh('widening-gutter-channel', scene, {
    widthM: TRAVEL_LANE_WIDTH_M,
    depthM: CHANNEL_DEPTH_M,
    startZ: -GUTTER_RAMP_M,
    lengthM: totalM,
    centreX: 0,
    rings: Math.ceil(totalM * RINGS_PER_M) + 1,
    depthAt: (f) => Math.min(1, f / rampFraction, (1 - f) / rampFraction),
  });
  channel.material = gutterMaterial(scene);
  channel.parent = root;
  const closeHole = openBoardHole(scene, () => {
    const at = root.getAbsolutePosition();
    return {
      minX: at.x - TRAVEL_LANE_WIDTH_M / 2,
      maxX: at.x + TRAVEL_LANE_WIDTH_M / 2,
      minZ: at.z - GUTTER_RAMP_M,
      maxZ: at.z + lengthM + GUTTER_RAMP_M,
    };
  });
  return {
    root,
    dispose: () => {
      closeHole();
      root.dispose(false, false);
    },
  };
};
