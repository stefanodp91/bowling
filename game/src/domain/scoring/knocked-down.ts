import { pinSpots, type PinNumber } from '@models/measures/pins';
import { DOWN_SHIFT_M, DOWN_TILT_DEG } from '../../config/pins';

/** A pin's pose relative to the head pin spot: its base centre and its unit up axis. */
export interface PinPose {
  readonly x: number;
  readonly z: number;
  readonly up: readonly [number, number, number];
}

const DEGREES_PER_RADIAN = 180 / Math.PI;

/** Tilt from vertical, degrees, of a pin whose axis points along `up`. */
export function tiltDeg(up: readonly [number, number, number]): number {
  const length = Math.hypot(...up);
  return Math.acos(Math.min(1, Math.max(-1, up[1] / length))) * DEGREES_PER_RADIAN;
}

/** The knocked-down rule (rule 4): tilted more than DOWN_TILT_DEG, or moved more than DOWN_SHIFT_M. */
export function isDown(pin: PinNumber, pose: PinPose): boolean {
  const spot = pinSpots().find((s) => s.pin === pin);
  if (spot === undefined) return true;
  const shift = Math.hypot(pose.x - spot.x, pose.z - spot.z);
  return tiltDeg(pose.up) > DOWN_TILT_DEG || shift > DOWN_SHIFT_M;
}

/** The pins down, in pin order; a pin with no pose (fallen out of the world) counts as down. */
export function pinsDown(poses: ReadonlyMap<PinNumber, PinPose>): PinNumber[] {
  return pinSpots()
    .map((s) => s.pin)
    .filter((pin) => {
      const pose = poses.get(pin);
      return pose === undefined || isDown(pin, pose);
    });
}
