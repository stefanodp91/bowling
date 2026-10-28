/** HUD tunables (wiki/game/hud.md). */
import { READY_S } from './run';

/** The countdown shows 3, 2, 1 over the ready phase (rule 3). */
export const COUNTDOWN_FROM = 3;
export const COUNTDOWN_STEP_S = READY_S / COUNTDOWN_FROM;
/**
 * «Roll» stays on screen for the first 5 m (≈ 0.8 s at the start speed; design). Measured in metres,
 * so a run started mid-lane with `?at=` shows no banner.
 */
export const ROLL_BANNER_M = 5;
/** The end screen goes back to the start menu by itself after 10 s (rule 4). */
export const AUTO_MENU_S = 10;
/** Speed is shown in km/h, which a room reads at a glance: 1 m/s = 3.6 km/h. */
export const KMH_PER_MPS = 3.6;
/** The key that pauses the run, as the pause button does (rule 9). */
export const PAUSE_KEY = 'Escape';
