import { SEGMENT_LENGTH_M } from '@models/measures/lane';
import { FOG_END_M } from './camera';

/** Scene tunables: what is drawn, and how far (wiki/game/run.md, wiki/models/lane.md rule 4). */

/** Lane segments kept behind the camera, so the lane never starts at the camera's feet. */
export const SEGMENTS_BEHIND = 1;
/** Lane segments drawn from the camera to beyond the fog. */
export const SEGMENTS_AHEAD = Math.ceil(FOG_END_M / SEGMENT_LENGTH_M) + 1;
/** Obstacle models exist from this far behind the camera to the end of the fog. */
export const OBSTACLES_BEHIND_M = 10;
/** Swing period of the sweep bar, seconds (design: a slow sway, wiki/models/obstacles/sweep-bar.md). */
export const SWEEP_SWING_PERIOD_S = 2.4;
/** Lights of the game: ambient fill and a key from above and behind, intensities (design). */
export const AMBIENT_INTENSITY = 0.55;
export const KEY_LIGHT = { direction: [0.25, -1, 0.5], intensity: 1.4 } as const;
