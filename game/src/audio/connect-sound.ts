import type { Session } from '../app/session';
import { cuesFor, freshBudget, rollMix, type ClackBudget } from './cues';
import type { SoundPlayer } from './sound-player';

/**
 * Plays a session through a player: the rumble follows the published speed every frame, and each
 * batch of events becomes cues. Returns the disconnect.
 */
export function connectSound(session: Pick<Session, 'store' | 'onEvents'>, player: SoundPlayer): () => void {
  let budget: ClackBudget = freshBudget;
  const offStore = session.store.subscribe(() => {
    const snapshot = session.store.get();
    player.roll(rollMix(snapshot.speedMps, snapshot.phase === 'rolling'));
  });
  const offEvents = session.onEvents((events) => {
    const result = cuesFor(events, budget);
    budget = result.budget;
    for (const cue of result.cues) player.play(cue);
  });
  return () => {
    offStore();
    offEvents();
    player.stopRoll();
  };
}
