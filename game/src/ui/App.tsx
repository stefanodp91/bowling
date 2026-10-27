import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parseQuery, type GameQuery } from '../app/query';
import { GameCanvas } from '../scene';
import { ErrorScreen } from './ErrorScreen';
import { Hud } from './hud/Hud';
import { LoadingScreen } from './LoadingScreen';
import { nextRunSearch } from './next-run';
import { useSound } from './use-sound';
import { useGameSession } from './use-game-session';

const FALLBACK_QUERY: GameQuery = { pause: false, driver: 'auto' };

/** The page: the 3D scene of the current run, or a readable error. */
export function App() {
  const { t } = useTranslation();
  const parsed = useMemo(() => parseQuery(window.location.search), []);
  const [query, setQuery] = useState<GameQuery>(parsed.ok ? parsed.query : FALLBACK_QUERY);
  /** Bumped by Retry and by every new run: a fresh session and a fresh scene, in the same page. */
  const [attempt, setAttempt] = useState(0);
  const state = useGameSession(query, attempt, t);
  const sound = useSound(state.status === 'running' ? state.session : null);
  const retry = () => setAttempt((n) => n + 1);
  // The next run stays in this page (wiki/game/hud.md, rule 4): a reload would close the audio the
  // audience hears, and the browser would want another gesture before playing anything.
  const runAgain = useCallback(() => {
    if (state.status !== 'running') return;
    const search = nextRunSearch(state.session.track.trackId, state.playOrder, state.session.store.get().skill);
    const next = parseQuery(search);
    if (!next.ok) return;
    window.history.replaceState(null, '', `?${search}`);
    setQuery(next.query);
    setAttempt((n) => n + 1);
  }, [state]);
  if (!parsed.ok) return <ErrorScreen message={t('error.query', { field: parsed.field })} onRetry={retry} />;
  if (state.status === 'failed') return <ErrorScreen message={state.message} onRetry={retry} />;
  if (state.status === 'loading') return <LoadingScreen />;
  return (
    <>
      <GameCanvas key={attempt} session={state.session} pause={query.pause} havok={state.havok} />
      <Hud session={state.session} onRunAgain={runAgain} sound={sound} />
    </>
  );
}
