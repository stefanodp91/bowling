import { useEffect, useState } from 'react';
import type { TFunction } from 'i18next';
import { loadTrack, TrackLoadError } from '../app/load-track';
import type { GameQuery } from '../app/query';
import { createSession, type Session } from '../app/session';
import { DEFAULT_SKILL } from '../config/pilot';
import { installTestHook } from '../dev/test-hook';
import { createAutopilot } from '../pilot/command-source';
import { loadHavok, type HavokInstance } from '../scene';

export type SessionState =
  | { readonly status: 'loading' }
  | { readonly status: 'running'; readonly session: Session; readonly havok: HavokInstance }
  | { readonly status: 'failed'; readonly message: string };

const fetchJson = (url: string) => fetch(url);

function describe(error: unknown, t: TFunction): string {
  if (error instanceof TrackLoadError) return t(error.reason === 'not-found' ? 'error.trackNotFound' : 'error.trackInvalid', { detail: error.detail });
  return t('error.physics', { detail: error instanceof Error ? error.message : String(error) });
}

/** Loads the track named by the query and starts a session; `attempt` restarts it (Retry). */
export function useGameSession(query: GameQuery, attempt: number, t: TFunction): SessionState {
  const [state, setState] = useState<SessionState>({ status: 'loading' });
  useEffect(() => {
    let cancelled = false;
    let uninstall = (): void => {};
    setState({ status: 'loading' });
    Promise.all([loadTrack(fetchJson, query.track), loadHavok()])
      .then(([{ track }, havok]) => {
        if (cancelled) return;
        const session = createSession({
          track,
          skill: query.skill ?? DEFAULT_SKILL,
          // The run's seed is the track's: the browser plays exactly what simulateRun predicts.
          commands: createAutopilot(track.seed),
          ...(query.at === undefined ? {} : { startAtZ: query.at }),
          ...(query.speedup === undefined ? {} : { speedup: query.speedup }),
        });
        uninstall = installTestHook(session.store);
        setState({ status: 'running', session, havok });
      })
      .catch((error: unknown) => {
        console.error('track loading failed', error);
        if (!cancelled) setState({ status: 'failed', message: describe(error, t) });
      });
    return () => {
      cancelled = true;
      uninstall();
    };
  }, [query, attempt, t]);
  return state;
}
