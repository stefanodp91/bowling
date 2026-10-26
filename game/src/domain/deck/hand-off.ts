import { CENTRE_LANE, laneCentreX } from '@models/measures/lane';
import { POCKET_OFFSET_M } from '../../config/pins';
import type { World } from '../simulation';

/**
 * Where the ball enters the deck (wiki/game/pins.md, rule 1): from the centre lane, the pocket;
 * from another lane, straight on along it. Plus the aim error the impacts left.
 */
export function handOffX(world: World): number {
  const target = world.run.lane === CENTRE_LANE ? POCKET_OFFSET_M : laneCentreX(world.run.lane);
  return target + world.impacts.aimErrorM;
}
