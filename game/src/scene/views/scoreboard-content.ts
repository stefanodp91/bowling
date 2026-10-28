import { PLAYING_LANE_NUMBER, type ScoreboardContent } from '@models';
import type { TFunction } from 'i18next';
import type { GameSnapshot } from '../../app/snapshot';
import { STRIKE_PINS } from '../../config/pins';

/**
 * What the live screen of the scoreboard shows for a snapshot (wiki/models/lane.md, rule 6): the
 * lane and track, the autopilot's skill, the impacts, and the distance — then the score, or
 * «STRIKE!», once the pins are judged. Every word comes from the i18n layer.
 */
export function scoreboardContent(snapshot: GameSnapshot, t: TFunction): ScoreboardContent {
  const judged = snapshot.pinsDown;
  const score =
    judged === null
      ? t('hud.distance', { metres: Math.max(0, Math.round(snapshot.z)) })
      : judged.length === STRIKE_PINS
        ? t('end.strike')
        : t('end.score', { score: judged.length });
  return {
    title: t('scoreboard.title', { lane: PLAYING_LANE_NUMBER, track: snapshot.trackId }),
    subtitle: t('hud.skill', { skill: t(`skill.${snapshot.resultSkill ?? snapshot.skill}`) }),
    detail: t('hud.impacts', { count: snapshot.impacts }),
    score,
    pinsDown: judged,
  };
}

/** Two contents draw the same picture when every field is the same. */
export const sameContent = (a: ScoreboardContent, b: ScoreboardContent): boolean =>
  a.title === b.title && a.subtitle === b.subtitle && a.detail === b.detail && a.score === b.score && a.pinsDown?.join() === b.pinsDown?.join();
