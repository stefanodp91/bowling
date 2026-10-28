import type { PinNumber } from '@models/measures/pins';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AUTO_MENU_S } from '../../config/hud';
import { STRIKE_PINS } from '../../config/pins';
import type { Skill } from '../../config/pilot';
import styles from './EndScreen.module.css';
import { PinDiagram } from './PinDiagram';

export interface EndScreenProps {
  readonly pinsDown: readonly PinNumber[];
  readonly impacts: number;
  readonly skill: Skill;
  readonly onMenu: () => void;
}

const SECOND_MS = 1000;

/** The result (rule 4): pin diagram, score, «STRIKE!» for ten, impacts and skill, «Menu», back to the menu by itself. */
export function EndScreen({ pinsDown, impacts, skill, onMenu }: EndScreenProps) {
  const { t } = useTranslation();
  const [secondsLeft, setSecondsLeft] = useState(AUTO_MENU_S);
  useEffect(() => {
    if (secondsLeft <= 0) {
      onMenu();
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), SECOND_MS);
    return () => window.clearTimeout(timer);
  }, [secondsLeft, onMenu]);
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
      <button type="button" className={styles.again} onClick={onMenu}>
        {t('end.menu')}
      </button>
      <span className={styles.auto}>{t('end.autoMenu', { seconds: secondsLeft })}</span>
    </section>
  );
}
