import { useTranslation } from 'react-i18next';
import styles from './SoundToggle.module.css';

/** Finds the toggle (its `data-sound-toggle` attribute), so the page-wide «first press unlocks» listener leaves its presses alone. */
export const SOUND_TOGGLE_SELECTOR = '[data-sound-toggle]';

export interface SoundToggleProps {
  readonly on: boolean;
  readonly onToggle: () => void;
}

/** Sound on or off (wiki/audio/sounds.md, rule 4): the label says the state, aria-pressed too. */
export function SoundToggle({ on, onToggle }: SoundToggleProps) {
  const { t } = useTranslation();
  return (
    <button type="button" className={styles.toggle} aria-pressed={on} onClick={onToggle} data-sound-toggle>
      {t(on ? 'sound.on' : 'sound.off')}
    </button>
  );
}
