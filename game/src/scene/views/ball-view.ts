import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { createBall } from '@models';
/** The ball's centre on the lane and its lowest point's height. */
export interface BallPose {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/** The player's ball: placed at the run's position, turned by its roll angle (ω = v / r). */
export interface BallView {
  /** The ball's root: physics takes it over at the pin deck. */
  readonly root: TransformNode;
  update(pose: BallPose, rollRad: number): void;
  dispose(): void;
}

export function createBallView(scene: Scene): BallView {
  const ball = createBall(scene, { variant: 'player' });
  return {
    root: ball.root,
    update: (pose, rollRad) => {
      ball.root.position.set(pose.x, pose.y, pose.z);
      ball.spin.rotation.x = rollRad;
    },
    dispose: ball.dispose,
  };
}
