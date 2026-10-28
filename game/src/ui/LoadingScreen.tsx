import { useTranslation } from 'react-i18next';
import styles from './LoadingScreen.module.css';

/** Shown while the track and the physics engine load: never a blank page. */
export function LoadingScreen() {
  const { t } = useTranslation();
  return (
    <div className={styles.screen} role="status">
      {t('loading')}
    </div>
  );
}
