import { useSyncExternalStore } from 'react';
import type { GameSnapshot } from '../../app/snapshot';
import type { Store } from '../../app/store';

/** The HUD's one way to read the run: the session's typed store (rule 6). */
export function useSnapshot(store: Store<GameSnapshot>): GameSnapshot {
  return useSyncExternalStore(store.subscribe, store.get);
}
