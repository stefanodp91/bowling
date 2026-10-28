import { useTranslation } from 'react-i18next';
import type { GameSnapshot } from '../../app/snapshot';
import { COUNTDOWN_FROM, COUNTDOWN_STEP_S, ROLL_BANNER_M } from '../../config/hud';
import styles from './Countdown.module.css';

export interface CountdownProps {
  readonly snapshot: GameSnapshot;
}

/** 3-2-1 during `ready`, then «Roll» for a moment (rule 3). */
export function Countdown({ snapshot }: CountdownProps) {
  const { t } = useTranslation();
  if (snapshot.phase === 'ready') {
    const number = COUNTDOWN_FROM - Math.floor(snapshot.phaseS / COUNTDOWN_STEP_S);
    return (
      <div className={styles.countdown} aria-live="assertive">
        {String(Math.max(1, number))}
      </div>
    );
  }
  if (snapshot.phase === 'rolling' && snapshot.z < ROLL_BANNER_M) {
    return (
      <div className={styles.countdown} aria-live="assertive">
        {t('countdown.roll')}
      </div>
    );
  }
  return null;
}
