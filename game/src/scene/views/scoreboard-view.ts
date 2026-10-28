import type { Scene } from '@babylonjs/core/scene';
import { createScoreboard, LANE_LENGTH_M, MASKING_WALL_Z_M, SCOREBOARD_STANDOFF_M, type Scenery } from '@models';
import type { TFunction } from 'i18next';
import type { Session } from '../../app/session';
import { sameContent, scoreboardContent } from './scoreboard-content';

/**
 * The scoreboard over the pins, kept up to date with the run (wiki/models/lane.md, rule 6): its live
 * screen is redrawn only when what it shows changes. Returns the dispose.
 */
export function createScoreboardView(scene: Scene, session: Pick<Session, 'store'>, scenery: Scenery, t: TFunction): () => void {
  let shown = scoreboardContent(session.store.get(), t);
  const scoreboard = createScoreboard(scene, { scenery, content: shown });
  scoreboard.root.position.z = LANE_LENGTH_M + MASKING_WALL_Z_M - SCOREBOARD_STANDOFF_M;
  const unsubscribe = session.store.subscribe(() => {
    const next = scoreboardContent(session.store.get(), t);
    if (sameContent(next, shown)) return;
    shown = next;
    scoreboard.show(next);
  });
  return () => {
    unsubscribe();
    scoreboard.dispose();
  };
}
