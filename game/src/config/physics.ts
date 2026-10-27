/**
 * Physics tunables (wiki/game/pins.md, rules 2 and 3). Each friction and restitution value names the
 * source it was chosen from (wiki/game/pins.md, References).
 */
import { PIN_HEIGHT_M } from '@models/measures/pins';
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
 * pins.md References) model wood and resin with moderate friction and restitution; the values
 * here are design choices inside those ranges. Varying them (pin friction 0.3–0.5, restitution
 * 0.5–0.75, ball restitution 0.4–0.6) did not change the pocket outcome: a straight ball on the
 * pocket leaves pin 8 (wiki/records/deck-tests-20261027.md, wiki/review.md).
 */
export const LANE_SURFACE = { friction: 0.2, restitution: 0.3 } as const;
export const BALL_SURFACE = { friction: 0.2, restitution: 0.6 } as const;
export const PIN_SURFACE = { friction: 0.4, restitution: 0.65 } as const;
/**
 * A pin's centre of mass sits low, about 38 % of its height (design: a solid wood pin is heavier at
 * the belly than at the neck); 0.145 m above the base of a regulation pin.
 */
export const PIN_CENTRE_OF_MASS_SHARE = 0.38;
export const PIN_CENTRE_OF_MASS_M = PIN_CENTRE_OF_MASS_SHARE * PIN_HEIGHT_M;
