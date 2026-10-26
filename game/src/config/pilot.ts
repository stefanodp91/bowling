/**
 * Autopilot tunables (wiki/pilot/autopilot.md, rule 5). The skill ids are needed by the query
 * parameters and the HUD before the pilot itself exists.
 */
export const SKILLS = ['perfect', 'good', 'sloppy'] as const;
export type Skill = (typeof SKILLS)[number];

/** The skill when none is asked for (wiki/game/hud.md, rule 2). */
export const DEFAULT_SKILL: Skill = 'good';
