import { SEGMENT_LENGTH_M } from '@models';
import { SEGMENTS_AHEAD, SEGMENTS_BEHIND } from '../../config/scene';

/** How many recycled segments are drawn at once, behind and ahead of the camera. */
export const SEGMENT_POOL_SIZE = SEGMENTS_BEHIND + SEGMENTS_AHEAD;

/** Index of the first segment drawn when the camera is at `cameraZ` (wiki/models/lane.md, rule 4). */
export function firstVisibleSegment(cameraZ: number): number {
  return Math.max(0, Math.floor(cameraZ / SEGMENT_LENGTH_M) - SEGMENTS_BEHIND);
}
