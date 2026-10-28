/** Fixed light and camera of the catalogue (wiki/storybook/catalog.md, rule 2). */

/** Camera poses a story can be shot from (`npm run shot -- story:<id> --angle <name>`). */
export const STAGE_ANGLES = ['default', 'close'] as const;
export type StageAngle = (typeof STAGE_ANGLES)[number];

/** Orbit angles in radians and the distance as a multiple of the framing radius. */
export const STAGE_POSES: Readonly<Record<StageAngle, { alpha: number; beta: number; distanceFactor: number }>> = {
  default: { alpha: -Math.PI * 0.62, beta: Math.PI * 0.36, distanceFactor: 1.3 },
  close: { alpha: -Math.PI * 0.55, beta: Math.PI * 0.42, distanceFactor: 0.85 },
};

/** Vertical field of view of the stage camera, radians (Babylon's default, 0.8). */
export const STAGE_FOV_RAD = 0.8;

/** The floor extends this many times the model's largest extent. */
export const FLOOR_SIZE_FACTOR = 4;

/** Smallest floor, metres: small models still stand on a visible floor. */
export const FLOOR_MIN_SIZE_M = 2;

/** Key light: direction (from above, front-left) and intensity; ambient fill intensity. */
export const KEY_LIGHT = { direction: [0.4, -1, 0.6], intensity: 1.6 } as const;
export const AMBIENT_LIGHT_INTENSITY = 0.6;

/** Background colour of the stage, a dark neutral (hex). */
export const STAGE_BACKGROUND_HEX = '#1B1D22';

/** Frames rendered after the scene is ready before the story says it is ready (catalog rule 4). */
export const READY_AFTER_FRAMES = 2;

/** Near clipping plane, metres: close enough for a 0.1 m model at close-up. */
export const STAGE_NEAR_M = 0.01;

/**
 * The stage camera follows the mouse (a human asked on 2026-10-28 to turn the models round): drag
 * to orbit, wheel to zoom, right-drag or Ctrl-drag to pan. The pose a story opens with is still the
 * fixed one above, so shots never change.
 */
/** Each wheel notch moves the camera this share of its distance: the same feel at every size. */
export const WHEEL_ZOOM_SHARE = 0.01;
/** Zoom stops this close and this far, as multiples of the opening distance. */
export const ZOOM_LIMITS = { nearest: 0.15, farthest: 4 } as const;
/** Dragging across this many pixels pans the camera by twice the framing radius. */
export const PAN_PIXELS_PER_TWO_RADII = 1000;
