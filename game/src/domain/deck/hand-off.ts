import { CENTRE_LANE, laneCentreX } from '@models/measures/lane';
import { AIM_MISS_SALT, SKILL_PROFILES, type Skill } from '../../config/pilot';
import { POCKET_OFFSET_M } from '../../config/pins';
import { aimSideOf } from '../impacts/impacts';
import { seededRandom, uniform } from '../random';
import type { World } from '../simulation';

/**
 * How far off the pocket a skill delivers the ball in a run of `trackSeed`: its profile's miss,
 * drawn once per run, on the side the impacts push to (wiki/pilot/autopilot.md, rule 6).
 */
export function aimMissOf(skill: Skill, trackSeed: number): number {
  const { min, max } = SKILL_PROFILES[skill].aimMissM;
  return aimSideOf(trackSeed) * uniform(seededRandom(trackSeed ^ AIM_MISS_SALT), min, max);
}

/**
 * Where the ball enters the deck (wiki/game/pins.md, rule 1): from the centre lane, the pocket plus
 * the skill's miss; from another lane, straight on along it. Plus the aim error the impacts left.
 */
export function handOffX(world: World, skill: Skill, trackSeed: number): number {
  const target = world.run.lane === CENTRE_LANE ? POCKET_OFFSET_M + aimMissOf(skill, trackSeed) : laneCentreX(world.run.lane);
  return target + world.impacts.aimErrorM;
}
