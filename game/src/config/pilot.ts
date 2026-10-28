/** Autopilot tunables (wiki/pilot/autopilot.md, rule 5). */

export const SKILLS = ['perfect', 'dummy'] as const;
export type Skill = (typeof SKILLS)[number];

/** The skill when none is asked for (wiki/game/hud.md, rule 2). */
export const DEFAULT_SKILL: Skill = 'perfect';

export interface SkillProfile {
  /** The pilot notices an obstacle when it is this many seconds away. */
  readonly noticeS: number;
  /** Chance to ignore an obstacle it noticed, drawn once per obstacle. */
  readonly ignoreChance: number;
  /**
   * Target fixation: steers towards the lane of an obstacle it failed to handle, as a beginner
   * steers towards what they stare at, instead of only letting it come.
   */
  readonly fixates: boolean;
  /** How far off the pocket it delivers the ball, metres: drawn once per run between these bounds. */
  readonly aimMissM: { readonly min: number; readonly max: number };
}

/**
 * The two profiles (rule 5, table; a human asked on 2026-10-28 for a perfect game and a beginner).
 * The dummy's miss is where the deck, at every speed a dummy reaches it, leaves 3 to 8 pins down:
 * 0.3–0.8 m right of the pocket, 0.5–0.9 m left (wiki/records/pilot-vs-blind-200m-20261028.md); its impacts
 * then add at most a few centimetres each (wiki/game/impacts.md, rule 2).
 */
export const SKILL_PROFILES = {
  perfect: { noticeS: 1.0, ignoreChance: 0, fixates: false, aimMissM: { min: 0, max: 0 } },
  dummy: { noticeS: 0.6, ignoreChance: 0.4, fixates: true, aimMissM: { min: 0.45, max: 0.6 } },
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
/** Salt for the once-per-run draw of a skill's miss at the pins, distinct from the other salts (design). */
export const AIM_MISS_SALT = 0x165667b1;

/** Who drives: the autopilot, or the blind baseline of headless runs (wiki/pilot/headless-runs.md). */
export const DRIVERS = ['auto', 'blind'] as const;
export type Driver = (typeof DRIVERS)[number];

/** The blind baseline: a random command every 0.3–1.2 s (design: «taps without looking»). */
export const BLIND_INTERVAL_S = { min: 0.3, max: 1.2 } as const;
/** Salt for the blind driver's draws, distinct from the other salts (design). */
export const BLIND_SALT = 0xc2b2ae35;
