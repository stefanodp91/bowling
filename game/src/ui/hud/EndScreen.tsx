import type { PinNumber } from '@models/measures/pins';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AUTO_RESTART_S } from '../../config/hud';
import { STRIKE_PINS } from '../../config/pins';
import type { Skill } from '../../config/pilot';
import styles from './EndScreen.module.css';
import { PinDiagram } from './PinDiagram';

export interface EndScreenProps {
  readonly pinsDown: readonly PinNumber[];
  readonly impacts: number;
  readonly skill: Skill;
  readonly onRunAgain: () => void;
}

const SECOND_MS = 1000;

/** The result (rule 4): pin diagram, score, «STRIKE!» for ten, impacts and skill, «Run again», auto restart. */
export function EndScreen({ pinsDown, impacts, skill, onRunAgain }: EndScreenProps) {
  const { t } = useTranslation();
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RESTART_S);
  useEffect(() => {
    if (secondsLeft <= 0) {
      onRunAgain();
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), SECOND_MS);
    return () => window.clearTimeout(timer);
  }, [secondsLeft, onRunAgain]);
  const score = pinsDown.length;
  return (
    <section className={styles.screen} aria-live="polite">
      <PinDiagram down={pinsDown} />
      <p className={styles.score}>{t('end.score', { score })}</p>
      {score === STRIKE_PINS ? <p className={styles.strike}>{t('end.strike')}</p> : null}
      <div className={styles.details}>
        <span>{t('end.impacts', { count: impacts })}</span>
        <span>{t('end.skill', { skill: t(`skill.${skill}`) })}</span>
      </div>
      <button type="button" className={styles.again} onClick={onRunAgain}>
        {t('end.runAgain')}
      </button>
      <span className={styles.auto}>{t('end.autoRestart', { seconds: secondsLeft })}</span>
    </section>
  );
}
