/**
 * The size of the props against the lane (wiki/models/conventions.md, «Props are twice life
 * size»). Pure: imports nothing.
 */

/**
 * The ball, the pins, the obstacles and the pin deck are twice their regulation size, the lane is
 * not: a human's decision of 2026-10-27, because at true size the props looked tiny on a three-lane,
 * 300 m lane seen from the chase camera.
 */
export const PROP_SCALE = 2;

/** Masses grow with the volume, so densities and the ball-to-pin mass ratio stay real. */
export const PROP_MASS_SCALE = PROP_SCALE ** 3;
