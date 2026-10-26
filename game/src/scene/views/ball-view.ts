import type { Scene } from '@babylonjs/core/scene';
import { createBall } from '@models';
import type { BallPose } from '../camera/chase-rig';

/** The player's ball: placed at the run's position, turned by its roll angle (ω = v / r). */
export function createBallView(scene: Scene): { update(pose: BallPose, rollRad: number): void; dispose(): void } {
  const ball = createBall(scene, { variant: 'player' });
  return {
    update: (pose, rollRad) => {
      ball.root.position.set(pose.x, pose.y, pose.z);
      ball.spin.rotation.x = rollRad;
    },
    dispose: ball.dispose,
  };
}
