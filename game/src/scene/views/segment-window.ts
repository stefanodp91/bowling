import { SEGMENT_LENGTH_M } from '@models';
import { SEGMENTS_AHEAD, SEGMENTS_BEHIND } from '../../config/scene';

/** How many recycled segments are drawn at once, behind and ahead of the camera. */
export const SEGMENT_POOL_SIZE = SEGMENTS_BEHIND + SEGMENTS_AHEAD;

/**
 * The first segment ever drawn: one before the foul line, the approach where the bowler stands and
 * the ball return waits, so the start of a run never looks into the void.
 */
export const FIRST_SEGMENT = -1;

/** Index of the first segment drawn when the camera is at `cameraZ` (wiki/models/lane.md, rule 4). */
export function firstVisibleSegment(cameraZ: number): number {
  return Math.max(FIRST_SEGMENT, Math.floor(cameraZ / SEGMENT_LENGTH_M) - SEGMENTS_BEHIND);
}
