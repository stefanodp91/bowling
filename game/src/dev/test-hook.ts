import type { GameSnapshot } from '../app/snapshot';
import type { Store } from '../app/store';
import { renderStats, type RenderStats } from './render-stats';
import { soundStatus, type SoundStatus } from './sound-status';

/**
 * window.__bowling (wiki/game/run.md, rule 8): a read-only view of the run for headless tools
 * (shot, pilot), so they read the run without scraping the screen. It changes no behaviour.
 */
export interface TestHook {
  readonly ready: boolean;
  snapshot(): GameSnapshot;
  renderStats(): RenderStats;
  soundStatus(): SoundStatus | null;
}

declare global {
  interface Window {
    __bowling?: TestHook;
  }
}

export function installTestHook(store: Store<GameSnapshot>): () => void {
  window.__bowling = {
    get ready() {
      return store.get().ready;
    },
    snapshot: () => store.get(),
    renderStats,
    soundStatus,
  };
  return () => {
    delete window.__bowling;
  };
}
