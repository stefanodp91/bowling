/** Frame loop tunables (wiki/game/run.md, rules 2 and 7). */

/**
 * The most fixed steps one rendered frame may run in real time: after a long stall (a hidden tab)
 * the run catches up at most a quarter of a second instead of jumping (design).
 */
export const MAX_STEPS_PER_FRAME = 30;

/** The largest `speedup` accepted from the query (steps per rendered frame for headless runs). */
export const MAX_SPEEDUP = 200;
