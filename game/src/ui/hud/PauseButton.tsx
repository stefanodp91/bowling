import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PAUSE_KEY } from '../../config/hud';
import styles from './PauseButton.module.css';

export interface PauseButtonProps {
  readonly onPause: () => void;
}

/** Pauses the run and opens the pause screen (wiki/game/hud.md, rule 9); Escape does the same. */
export function PauseButton({ onPause }: PauseButtonProps) {
  const { t } = useTranslation();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === PAUSE_KEY) onPause();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onPause]);
  return (
    <button type="button" className={styles.pause} onClick={onPause}>
      {t('pause.button')}
    </button>
  );
}
