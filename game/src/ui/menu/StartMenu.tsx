import { useTranslation } from 'react-i18next';
import { SKILLS, type Skill } from '../../config/pilot';
import styles from './StartMenu.module.css';

export interface StartMenuProps {
  /** The committed tracks, in play order (index.json). */
  readonly tracks: readonly string[];
  readonly track: string;
  readonly skill: Skill;
  readonly onTrack: (track: string) => void;
  readonly onSkill: (skill: Skill) => void;
  readonly onStart: () => void;
}

/**
 * The start menu (wiki/game/hud.md, rule 2): who the autopilot plays like, which track, «Start».
 * Drawn over the chosen track, the ball already in the bowler's hand.
 */
export function StartMenu({ tracks, track, skill, onTrack, onSkill, onStart }: StartMenuProps) {
  const { t } = useTranslation();
  return (
    <section className={styles.menu} aria-label={t('menu.label')}>
      <h1 className={styles.title}>{t('menu.title')}</h1>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>{t('skill.label')}</legend>
        <div className={styles.choices}>
          {SKILLS.map((option) => (
            <button key={option} type="button" className={styles.skill} aria-pressed={option === skill} onClick={() => onSkill(option)}>
              <span className={styles.name}>{t(`skill.${option}`)}</span>
              <span className={styles.description}>{t(`menu.skillDescription.${option}`)}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>{t('menu.trackLabel')}</legend>
        <div className={styles.choices}>
          {tracks.map((option) => (
            <button key={option} type="button" className={styles.track} aria-pressed={option === track} onClick={() => onTrack(option)}>
              {option}
            </button>
          ))}
        </div>
      </fieldset>
      {/* The start is also the gesture that lets the browser play sound. */}
      <button type="button" className={styles.start} onClick={onStart} autoFocus>
        {t('menu.start')}
      </button>
    </section>
  );
}
