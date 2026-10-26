/** Autopilot tunables (wiki/pilot/autopilot.md, rule 5). */

export const SKILLS = ['perfect', 'good', 'sloppy'] as const;
export type Skill = (typeof SKILLS)[number];

/** The skill when none is asked for (wiki/game/hud.md, rule 2). */
export const DEFAULT_SKILL: Skill = 'good';

export interface SkillProfile {
  /** The pilot notices an obstacle when it is this many seconds away. */
  readonly noticeS: number;
  /** Chance to ignore an obstacle it noticed, drawn once per obstacle. */
  readonly ignoreChance: number;
}

/** The three profiles (rule 5, table). */
export const SKILL_PROFILES = {
  perfect: { noticeS: 1.0, ignoreChance: 0 },
  good: { noticeS: 0.6, ignoreChance: 0.1 },
  sloppy: { noticeS: 0.35, ignoreChance: 0.3 },
} as const satisfies Readonly<Record<Skill, SkillProfile>>;

/** Obstacles met within this many seconds of the first one are solved together (rule 4; design). */
export const GROUP_WINDOW_S = 0.5;
/**
 * After the last obstacle of a group, the pilot keeps simulating this long, so a manoeuvre is judged
 * by where it leaves the ball, not only by the obstacles it dodges (design: longer than a jump).
 */
export const PLAN_TAIL_S = 0.7;
/** Salt mixed into the run seed for ignore draws, distinct from the aim-error salt (design). */
export const IGNORE_SALT = 0x85ebca6b;
