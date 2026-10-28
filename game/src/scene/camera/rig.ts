import { LANE_LENGTH_M, laneCentreX } from '@models/measures/lane';
import { LANE_CHANGE_S } from '../../config/run';
import {
  CHASE_BEHIND_M,
  CHASE_DAMPING_S,
  CHASE_HEIGHT_M,
  CHASE_JUMP_FOLLOW,
  CHASE_LOOK_AHEAD_M,
  IMPACT_BLEND_M,
  IMPACT_CAMERA_Z,
  IMPACT_VIEW,
  SLOWMO_S,
  SLOWMO_SCALE,
} from '../../config/camera';
import { smoothstep } from '../../domain/math/ease';
import type { LaneChange } from '../../domain/run/state';

type Vec3 = readonly [number, number, number];

/** Where the camera is and what it looks at: plain numbers, no engine types. */
export interface CameraPose {
  readonly position: Vec3;
  readonly target: Vec3;
}

/** What the rig reads from the run: the ball's centre, its lowest point's height, the last lane change. */
export interface RigInput {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly lastLaneChange: LaneChange | null;
}

const mix = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** The camera's x: follows the last lane change over LANE_CHANGE_S + CHASE_DAMPING_S, a little behind the ball. */
function followX(input: RigInput): number {
  const change = input.lastLaneChange;
  if (change === null) return input.x;
  const from = laneCentreX(change.from);
  return from + (laneCentreX(change.to) - from) * smoothstep(change.elapsedS / (LANE_CHANGE_S + CHASE_DAMPING_S));
}

/** Chase pose (rule 1): behind and above, damped sideways, following a jump only partly. */
export function chasePose(input: RigInput): CameraPose {
  const x = followX(input);
  const lift = input.y * CHASE_JUMP_FOLLOW;
  return { position: [x, CHASE_HEIGHT_M + lift, input.z - CHASE_BEHIND_M], target: [x, lift, input.z + CHASE_LOOK_AHEAD_M] };
}

/** The low side view of the deck (rule 2), in world coordinates. */
export function impactPose(): CameraPose {
  const at = (offset: Vec3): Vec3 => [offset[0], offset[1], LANE_LENGTH_M + offset[2]];
  return { position: at(IMPACT_VIEW.position), target: at(IMPACT_VIEW.target) };
}

/**
 * The camera rig: a pure function of the run (camera criterion 1). Chase until IMPACT_CAMERA_Z,
 * then a smooth blend over IMPACT_BLEND_M to the impact view, which stays until the result.
 */
export function cameraPose(input: RigInput): CameraPose {
  const blend = smoothstep((input.z - IMPACT_CAMERA_Z) / IMPACT_BLEND_M);
  if (blend <= 0) return chasePose(input);
  const chase = chasePose(input);
  const impact = impactPose();
  return { position: mix(chase.position, impact.position, blend), target: mix(chase.target, impact.target, blend) };
}

/**
 * Time scale for the frame clock (rule 3): SLOWMO_SCALE for SLOWMO_S of simulated time after the
 * first ball–pin contact, 1 otherwise. It stretches how much real time a fixed step covers, never
 * the step itself.
 */
export function timeScaleAt(sinceFirstContactS: number | null): number {
  return sinceFirstContactS !== null && sinceFirstContactS >= 0 && sinceFirstContactS < SLOWMO_S ? SLOWMO_SCALE : 1;
}
