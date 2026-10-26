import { CHASE_BEHIND_M, CHASE_HEIGHT_M, CHASE_JUMP_FOLLOW, CHASE_LOOK_AHEAD_M } from '../../config/camera';

/** Where the camera is and what it looks at: plain numbers, no engine types. */
export interface CameraPose {
  readonly position: readonly [number, number, number];
  readonly target: readonly [number, number, number];
}

/** The ball as the rig needs it: centre position and the lowest point's height. */
export interface BallPose {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/** Chase pose (wiki/game/camera.md, rule 1): behind and above, following a jump only partly. */
export function chasePose(ball: BallPose): CameraPose {
  const lift = ball.y * CHASE_JUMP_FOLLOW;
  return {
    position: [ball.x, CHASE_HEIGHT_M + lift, ball.z - CHASE_BEHIND_M],
    target: [ball.x, lift, ball.z + CHASE_LOOK_AHEAD_M],
  };
}
