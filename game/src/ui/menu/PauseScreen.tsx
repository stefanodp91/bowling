import { useTranslation } from 'react-i18next';
import { SoundToggle } from './SoundToggle';
import styles from './PauseScreen.module.css';

export interface PauseScreenProps {
  readonly sound: { readonly on: boolean; readonly toggle: () => void };
  readonly onResume: () => void;
  readonly onMainMenu: () => void;
}

/** The run stands still under it (wiki/game/hud.md, rule 9): go on where it stopped, or leave it for the start menu. */
export function PauseScreen({ sound, onResume, onMainMenu }: PauseScreenProps) {
  const { t } = useTranslation();
  return (
    <section className={styles.pause} aria-label={t('pause.label')}>
      <h1 className={styles.title}>{t('pause.title')}</h1>
      <button type="button" className={styles.resume} onClick={onResume} autoFocus>
        {t('pause.resume')}
      </button>
      <button type="button" className={styles.menu} onClick={onMainMenu}>
        {t('pause.mainMenu')}
      </button>
      <SoundToggle on={sound.on} onToggle={sound.toggle} />
    </section>
  );
}
