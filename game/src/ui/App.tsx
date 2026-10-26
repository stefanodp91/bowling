import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parseQuery } from '../app/query';
import { GameCanvas } from '../scene';
import { ErrorScreen } from './ErrorScreen';
import { useGameSession } from './use-game-session';

/** The page: the 3D scene of the current run, or a readable error. */
export function App() {
  const { t } = useTranslation();
  const parsed = useMemo(() => parseQuery(window.location.search), []);
  const query = useMemo(() => (parsed.ok ? parsed.query : { pause: false }), [parsed]);
  const [attempt, setAttempt] = useState(0);
  const state = useGameSession(query, attempt, t);
  const retry = () => setAttempt((n) => n + 1);
  if (!parsed.ok) return <ErrorScreen message={t('error.query', { field: parsed.field })} onRetry={retry} />;
  if (state.status === 'failed') return <ErrorScreen message={state.message} onRetry={retry} />;
  if (state.status === 'loading') return null;
  return <GameCanvas session={state.session} pause={query.pause} havok={state.havok} />;
}
