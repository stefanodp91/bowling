import { useEffect, useRef, useState } from 'react';
import type { TFunction } from 'i18next';
import { loadTrack, TrackLoadError } from '../app/load-track';
import type { GameQuery } from '../app/query';
import { createSession, type Session } from '../app/session';
import type { Skill } from '../config/pilot';
import { installTestHook } from '../dev/test-hook';
import { createBlindDriver } from '../pilot/blind';
import { createAutopilot } from '../pilot/command-source';
import { loadHavok, type HavokInstance } from '../scene';

export type SessionState =
  | { readonly status: 'loading' }
  | { readonly status: 'running'; readonly session: Session; readonly havok: HavokInstance; readonly playOrder: readonly string[] }
  | { readonly status: 'failed'; readonly message: string };

const fetchJson = (url: string) => fetch(url);

/** What the start menu decides for the next session (wiki/game/hud.md, rule 2). */
export interface SessionChoices {
  readonly skill: Skill;
  /** Hold the run at the foul line until the menu's «Start». */
  readonly waitForStart: boolean;
}

function describe(error: unknown, t: TFunction): string {
  if (error instanceof TrackLoadError) return t(error.reason === 'not-found' ? 'error.trackNotFound' : 'error.trackInvalid', { detail: error.detail });
  return t('error.physics', { detail: error instanceof Error ? error.message : String(error) });
}

/**
 * Loads the track named by the query and starts a session; `attempt` restarts it (Retry, back to
 * the menu). The choices are read when a session is created, not watched: a held session stays
 * held when the menu closes, until the menu calls its `start()`, and the menu changes the skill of
 * the session it holds in place.
 */
export function useGameSession(query: GameQuery, attempt: number, t: TFunction, choices: SessionChoices): SessionState {
  const [state, setState] = useState<SessionState>({ status: 'loading' });
  const choicesRef = useRef(choices);
  choicesRef.current = choices;
  useEffect(() => {
    let cancelled = false;
    let uninstall = (): void => {};
    setState({ status: 'loading' });
    Promise.all([loadTrack(fetchJson, query.track), loadHavok()])
      .then(([{ track, playOrder }, havok]) => {
        if (cancelled) return;
        // The run's seed defaults to the track's: the browser plays exactly what simulateRun predicts.
        const seed = query.seed ?? track.seed;
        const session = createSession({
          track,
          seed,
          skill: choicesRef.current.skill,
          commands: query.driver === 'blind' ? createBlindDriver(seed) : createAutopilot(seed),
          ...(query.at === undefined ? {} : { startAtZ: query.at }),
          ...(query.speedup === undefined ? {} : { speedup: query.speedup }),
          waitForStart: choicesRef.current.waitForStart,
        });
        uninstall = installTestHook(session.store);
        setState({ status: 'running', session, havok, playOrder });
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
