import { LANE_LENGTH_M } from '@models/measures/lane';
import { useTranslation } from 'react-i18next';
import type { GameSnapshot } from '../../app/snapshot';
import { KMH_PER_MPS } from '../../config/hud';
import styles from './RunInfo.module.css';

export interface RunInfoProps {
  readonly snapshot: GameSnapshot;
}

/** Distance as a bar and a number, speed, impacts, track (rule 1). */
export function RunInfo({ snapshot }: RunInfoProps) {
  const { t } = useTranslation();
  const metres = Math.min(LANE_LENGTH_M, Math.round(snapshot.z));
  return (
    <section className={styles.panel}>
      <progress className={styles.bar} aria-label={t('hud.progress')} max={LANE_LENGTH_M} value={metres} />
      <div className={styles.stats}>
        <span>{t('hud.distance', { metres })}</span>
        <span>{t('hud.speed', { kmh: Math.round(snapshot.speedMps * KMH_PER_MPS) })}</span>
        <span>{t('hud.impacts', { count: snapshot.impacts })}</span>
        <span>{t('hud.track', { id: snapshot.trackId })}</span>
      </div>
    </section>
  );
}
