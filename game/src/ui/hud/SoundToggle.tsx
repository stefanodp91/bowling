import { useTranslation } from 'react-i18next';
import styles from './SoundToggle.module.css';

export interface SoundToggleProps {
  readonly on: boolean;
  readonly onToggle: () => void;
}

/** Sound on or off (wiki/audio/sounds.md, rule 4): the label says the state, aria-pressed too. */
export function SoundToggle({ on, onToggle }: SoundToggleProps) {
  const { t } = useTranslation();
  return (
    <button type="button" className={styles.toggle} aria-pressed={on} onClick={onToggle}>
      {t(on ? 'sound.on' : 'sound.off')}
    </button>
  );
}
