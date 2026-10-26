import type { Scene } from '@babylonjs/core/scene';
import { createBall } from '../../ball/ball';
import { BALL_RADIUS_M } from '../../measures/ball';
import type { ModelFactory, ModelHandle } from '../../model-handle';

export interface ReturningBallOptions {
  /** The track's speed for this ball, metres per second, towards the foul line (-z). */
  readonly speedMps: number;
}

/**
 * A house ball rolling back up the lane (wiki/models/obstacles/returning-ball.md). The run moves
 * `root`; the model only spins the ball consistently with its speed: rolling towards -z without
 * slipping turns it about x by -v·t / r.
 */
export const createReturningBall: ModelFactory<ReturningBallOptions> = (scene: Scene, { speedMps }): ModelHandle => {
  const ball = createBall(scene, { variant: 'house' });
  return {
    root: ball.root,
    animate: (elapsedS) => {
      ball.spin.rotation.x = (-speedMps * elapsedS) / BALL_RADIUS_M;
    },
    dispose: ball.dispose,
  };
};
