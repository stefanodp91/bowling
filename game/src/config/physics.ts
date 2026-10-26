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
/** The floor starts this far behind the foul line, under the camera at the start. *//** The floor extends this far past the lane's ends and sides (pins fly into the pit, obstacles away). */
export const FLOOR_MARGIN_M = 6;

/**
 * Surface properties. Published simulations of ball–pin collisions (UC Davis BioSport, wiki/game/
 * pins.md References) model wood and resin with moderate friction and restitution; the exact
 * values here are design choices inside those ranges, tuned until a pocket hit at 12 m/s strikes
 * and an off-pocket hit does not (the deck record has the counts).
 */
export const LANE_SURFACE = { friction: 0.2, restitution: 0.3 } as const;
export const BALL_SURFACE = { friction: 0.2, restitution: 0.6 } as const;
export const PIN_SURFACE = { friction: 0.4, restitution: 0.65 } as const;
/**
 * A pin's centre of mass sits low, about 38 % of its height (design: a solid wood pin is heavier at
 * the belly than at the neck); 0.145 m above the base.
 */
export const PIN_CENTRE_OF_MASS_M = 0.145;
