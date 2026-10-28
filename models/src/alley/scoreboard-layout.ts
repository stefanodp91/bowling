import { ALLEY_INNER_X_M, NEIGHBOUR_LANE_WIDTH_M, NEIGHBOUR_LANES_PER_SIDE, neighbourLaneCentreX, SCOREBOARD_GAP_M } from '../measures/alley';
import { PLAYING_SURFACE_WIDTH_M } from '../measures/lane';
import type { PinNumber } from '../measures/pins';

/** One screen of the scoreboard: its centre across the room, its width, and the lane it names. */
export interface ScoreboardScreen {
  readonly centreX: number;
  readonly widthM: number;
  /** Lanes are numbered 1… from the left wall; the playing surface is the middle one. */
  readonly laneNumber: number;
  /** The live screen, over the playing surface; the others wait for players. */
  readonly live: boolean;
}

/** Lanes left of the playing surface, plus one: the playing surface's own number. */
export const PLAYING_LANE_NUMBER = NEIGHBOUR_LANES_PER_SIDE + 1;

/** The screens left to right: the neighbours' on each side, the live one in the middle (wiki/models/lane.md, rule 6). */
export function scoreboardScreens(): ScoreboardScreen[] {
  const neighbour = (side: -1 | 1, i: number): ScoreboardScreen => ({
    centreX: side * neighbourLaneCentreX(i),
    widthM: NEIGHBOUR_LANE_WIDTH_M - SCOREBOARD_GAP_M,
    laneNumber: PLAYING_LANE_NUMBER + side * (i + 1),
    live: false,
  });
  const indices = Array.from({ length: NEIGHBOUR_LANES_PER_SIDE }, (_, i) => i);
  return [
    ...indices.map((i) => neighbour(-1, i)).reverse(),
    { centreX: 0, widthM: 2 * ALLEY_INNER_X_M - SCOREBOARD_GAP_M, laneNumber: PLAYING_LANE_NUMBER, live: true },
    ...indices.map((i) => neighbour(1, i)),
  ];
}

/** The live screen's width, which is the playing surface's less the gap. */
export const LIVE_SCREEN_WIDTH_M = PLAYING_SURFACE_WIDTH_M - SCOREBOARD_GAP_M;

/** What the live screen shows: text the game has already localised, and the pins, once judged. */
export interface ScoreboardContent {
  /** First line, large: who plays where. */
  readonly title: string;
  readonly subtitle: string;
  readonly detail: string;
  /** The big number or word: the score, «STRIKE!», or how far the ball has come. */
  readonly score: string;
  /** Pins down once judged; null while the run is on (every pin drawn standing). */
  readonly pinsDown: readonly PinNumber[] | null;
}
