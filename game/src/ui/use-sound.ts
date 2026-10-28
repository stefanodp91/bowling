import { useCallback, useEffect, useState } from 'react';
import { connectSound } from '../audio/connect-sound';
import { createSoundPlayer, type SoundPlayer } from '../audio/sound-player';
import { registerSoundStatus } from '../dev/sound-status';
import type { Session } from '../app/session';
import { SOUND_TOGGLE_SELECTOR } from './menu/SoundToggle';

/**
 * The page's sound (wiki/audio/sounds.md, rule 4): one player for the whole page, so a new run
 * keeps what the audience hears. The first press anywhere turns sound on; the toggle alone switches
 * it afterwards — a press on the toggle itself is left to the toggle, or the two would undo each other.
 */
export function useSound(session: Session | null): { on: boolean; toggle: () => void } {
  const [player, setPlayer] = useState<SoundPlayer | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const created = createSoundPlayer();
    setPlayer(created);
    registerSoundStatus(() => created.status());
    const unlock = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest(SOUND_TOGGLE_SELECTOR) !== null) return;
      created.unlock();
      setOn(created.isOn());
    };
    window.addEventListener('pointerdown', unlock, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', unlock, { capture: true });
      registerSoundStatus(null);
      created.dispose();
    };
  }, []);
  useEffect(() => (player === null || session === null ? undefined : connectSound(session, player)), [player, session]);
  const toggle = useCallback(() => {
    if (player !== null) setOn(player.toggle());
  }, [player]);
  return { on, toggle };
}
