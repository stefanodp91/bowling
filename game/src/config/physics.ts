/**
 * Physics tunables (wiki/game/pins.md, rules 2 and 3). Each friction and restitution value names the
 * source it was chosen from (wiki/game/pins.md, References).
 */
import { SIM_STEP_S } from './run';

/** Standard gravity, m/s². */
export const GRAVITY_MPS2 = 9.81;
/** Havok advances by the simulation's fixed step, split in substeps for fast ball–pin contacts. */
export const PHYSICS_STEP_S = SIM_STEP_S;
export const PHYSICS_SUBSTEPS = 4;
/** The static floor under the whole lane: a slab this thick, its top at y = 0. */
export const FLOOR_THICKNESS_M = 0.2;
/** The floor extends this far past the lane's ends and sides (pins fly into the pit, obstacles away). */
export const FLOOR_MARGIN_M = 6;
