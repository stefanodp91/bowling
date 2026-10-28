import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SKILL_KEYS } from '../../config/hud';
import { SKILLS, type Skill } from '../../config/pilot';
import styles from './SkillButtons.module.css';

export interface SkillButtonsProps {
  readonly active: Skill;
  readonly onSelect: (skill: Skill) => void;
}

/** Perfect, Dummy: one click or key 1–2 switches the autopilot's skill, even mid-run (rule 2). */
export function SkillButtons({ active, onSelect }: SkillButtonsProps) {
  const { t } = useTranslation();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const index = SKILL_KEYS.findIndex((key) => key === event.key);
      const skill = SKILLS[index];
      if (skill !== undefined) onSelect(skill);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSelect]);
  return (
    <nav className={styles.panel} aria-label={t('skill.label')}>
      <span className={styles.label}>{t('skill.label')}</span>
      {SKILLS.map((skill) => (
        <button key={skill} type="button" className={styles.button} aria-pressed={skill === active} onClick={() => onSelect(skill)}>
          {t(`skill.${skill}`)}
        </button>
      ))}
      <span className={styles.hint}>{t('skill.hint')}</span>
    </nav>
  );
}
