/** Camera and draw-distance tunables (wiki/game/camera.md, rule 5). Metres and seconds. */

/** Chase camera: 3 m behind, 1.2 m above the ball, looking 6 m ahead (rule 1). */
export const CHASE_BEHIND_M = 3;
export const CHASE_HEIGHT_M = 1.2;
export const CHASE_LOOK_AHEAD_M = 6;
/** The camera follows a jump only by this fraction, so the jump reads as a jump (rule 1). */
export const CHASE_JUMP_FOLLOW = 0.35;
/** The camera's vertical field of view, radians (design: three lanes and the next obstacles readable from a projector; 0.9 made the ball too small). */
export const CHASE_FOV_RAD = 0.75;

/** Fog ahead of the camera: clear up to 60 m, gone by 140 m (rule 4). */
export const FOG_START_M = 60;
export const FOG_END_M = 140;
/** Fog colour: the dark of the alley (hex). */
export const FOG_HEX = '#121218';

/** The camera's lateral follow lags a lane change by this much, seconds (rule 1, damping). */
export const CHASE_DAMPING_S = 0.25;

/** The impact view starts 10 m before the head pin (rule 2)… */
export const IMPACT_CAMERA_Z = 490;
/** …and the blend from chase to impact view is complete this many metres later. */
export const IMPACT_BLEND_M = 4;
/**
 * The impact view: a low side view of the pin deck from the right, looking across the pins
 * (design: sees the ball arrive and the pins scatter). Offsets from the head pin spot, metres.
 */
export const IMPACT_VIEW = {
  position: [2.9, 0.75, -0.2],
  target: [-0.1, 0.2, 0.45],
} as const;

/** Slow motion: from the first ball–pin contact, 1.5 s of simulated time at half speed (rule 3). */
export const SLOWMO_S = 1.5;
export const SLOWMO_SCALE = 0.5;
