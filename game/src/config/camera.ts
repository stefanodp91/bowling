/** Camera and draw-distance tunables (wiki/game/camera.md, rule 5). Metres and seconds. */

/** Chase camera: 3 m behind, 1.2 m above the ball, looking 6 m ahead (rule 1). */
export const CHASE_BEHIND_M = 3;
export const CHASE_HEIGHT_M = 1.2;
export const CHASE_LOOK_AHEAD_M = 6;
/** The camera follows a jump only by this fraction, so the jump reads as a jump (rule 1). */
export const CHASE_JUMP_FOLLOW = 0.35;
/** The camera's vertical field of view, radians (design: wide enough to see three lanes at 3 m). */
export const CHASE_FOV_RAD = 0.9;

/** Fog ahead of the camera: clear up to 60 m, gone by 140 m (rule 4). */
export const FOG_START_M = 60;
export const FOG_END_M = 140;
/** Fog colour: the dark of the alley (hex). */
export const FOG_HEX = '#121218';
