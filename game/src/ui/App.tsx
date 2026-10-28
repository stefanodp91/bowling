import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parseQuery, type GameQuery } from '../app/query';
import { DEFAULT_SKILL, type Skill } from '../config/pilot';
import { GameCanvas } from '../scene';
import { ErrorScreen } from './ErrorScreen';
import { Hud } from './hud/Hud';
import { LoadingScreen } from './LoadingScreen';
import { StartMenu } from './menu/StartMenu';
import { useSound } from './use-sound';
import { useGameSession } from './use-game-session';

const FALLBACK_QUERY: GameQuery = { pause: false, driver: 'auto' };

/**
 * The page: the 3D scene of the current run, under the start menu or the HUD, or a readable error.
 * An address that names a track (the tools' shots and headless runs) starts at once; a bare one
 * opens the start menu (wiki/game/hud.md, rule 2).
 */
export function App() {
  const { t } = useTranslation();
  const parsed = useMemo(() => parseQuery(window.location.search), []);
  const [query, setQuery] = useState<GameQuery>(parsed.ok ? parsed.query : FALLBACK_QUERY);
  const [menuOpen, setMenuOpen] = useState(parsed.ok && parsed.query.track === undefined);
  /** Bumped by Retry and by every return to the menu: a fresh session and a fresh scene, in the same page. */
  const [attempt, setAttempt] = useState(0);
  const [skill, setSkill] = useState<Skill>(query.skill ?? DEFAULT_SKILL);
  const state = useGameSession(query, attempt, t, { skill, waitForStart: menuOpen });
  const sound = useSound(state.status === 'running' ? state.session : null);
  const retry = () => setAttempt((n) => n + 1);
  const session = state.status === 'running' ? state.session : null;
  const chooseSkill = useCallback(
    (next: Skill) => {
      // The held session changes in place; the next one is created with the choice.
      session?.setSkill(next);
      setSkill(next);
    },
    [session],
  );
  const chooseTrack = useCallback((track: string) => setQuery((current) => (current.track === track ? current : { ...current, track })), []);
  const start = useCallback(() => {
    session?.start();
    setMenuOpen(false);
  }, [session]);
  // The next run stays in this page (wiki/game/hud.md, rule 4): a reload would close the audio the
  // audience hears, and the browser would want another gesture before playing anything.
  const backToMenu = useCallback(() => {
    if (state.status !== 'running') return;
    const { trackId } = state.session.track;
    setQuery({ ...FALLBACK_QUERY, track: trackId });
    setMenuOpen(true);
    setAttempt((n) => n + 1);
  }, [state]);
  if (!parsed.ok) return <ErrorScreen message={t('error.query', { field: parsed.field })} onRetry={retry} />;
  if (state.status === 'failed') return <ErrorScreen message={state.message} onRetry={retry} />;
  if (state.status === 'loading') return <LoadingScreen />;
  return (
    <>
      <GameCanvas key={`${attempt}-${state.session.track.trackId}`} session={state.session} pause={query.pause} havok={state.havok} />
      {menuOpen ? (
        <StartMenu tracks={state.playOrder} track={state.session.track.trackId} skill={skill} onTrack={chooseTrack} onSkill={chooseSkill} onStart={start} />
      ) : (
        <Hud session={state.session} onMenu={backToMenu} sound={sound} />
      )}
    </>
  );
}
