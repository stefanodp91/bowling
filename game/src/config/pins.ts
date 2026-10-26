/** Pin-deck tunables (wiki/game/pins.md). */
import { BOARD_WIDTH_M } from '@models/measures/lane';
import { PIN_SPACING_M } from '@models/measures/pins';

/**
 * The pocket, 2.5 boards right of the head pin: a right-hander's ideal entry is board 17½ while the
 * head pin stands on board 20 (counted from the right), so the ball centre passes ≈ 6.8 cm right
 * of pin 1, between pins 1 and 3 (rule 1; bowling coaching references in wiki/game/pins.md).
 */
export const POCKET_BOARDS = 2.5;
export const POCKET_OFFSET_M = POCKET_BOARDS * BOARD_WIDTH_M;

/** Pins are judged 3 s after the first ball–pin contact (rule 4). */
export const SETTLE_S = 3;
/** A pin tilted more than 45° from vertical is down (rule 4). */
export const DOWN_TILT_DEG = 45;
/** A pin whose base moved more than half the pin spacing from its spot is down (rule 4). */
export const DOWN_SHIFT_M = PIN_SPACING_M / 2;
/** Ten pins down is a strike (rule 5). */
export const STRIKE_PINS = 10;
