import { useTranslation } from 'react-i18next';
import styles from './ErrorScreen.module.css';

export interface ErrorScreenProps {
  /** The already-translated message saying what failed. */
  readonly message: string;
  readonly onRetry: () => void;
}

/** Replaces everything when the demo cannot start: a readable message and «Retry», never blank. */
export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.screen} role="alert">
      <h1 className={styles.title}>{t('error.title')}</h1>
      <p className={styles.message}>{message}</p>
      <button type="button" className={styles.retry} onClick={onRetry}>
        {t('error.retry')}
      </button>
    </div>
  );
}
