import { useCallback, useEffect, useState } from 'react';
import { connectSound } from '../audio/connect-sound';
import { createSoundPlayer, type SoundPlayer } from '../audio/sound-player';
import type { Session } from '../app/session';

/**
 * The page's sound: silent until the first gesture, as browsers require; any pointer press unlocks
 * it, and the toggle mutes and unmutes (wiki/audio/sounds.md, rule 4).
 */
export function useSound(session: Session | null): { on: boolean; toggle: () => void } {
  const [player, setPlayer] = useState<SoundPlayer | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const created = createSoundPlayer();
    setPlayer(created);
    const unlock = () => {
      created.unlock();
      setOn(created.isOn());
    };
    window.addEventListener('pointerdown', unlock, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', unlock, { capture: true });
      created.dispose();
    };
  }, []);
  useEffect(() => (player === null || session === null ? undefined : connectSound(session, player)), [player, session]);
  const toggle = useCallback(() => {
    if (player === null) return;
    player.unlock();
    player.setMuted(on);
    setOn(!on);
  }, [player, on]);
  return { on, toggle };
}
