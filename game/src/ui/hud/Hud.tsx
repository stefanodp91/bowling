import type { Session } from '../../app/session';
import { Countdown } from './Countdown';
import { EndScreen } from './EndScreen';
import styles from './Hud.module.css';
import { RunInfo } from './RunInfo';
import { SkillButtons } from './SkillButtons';
import { useSnapshot } from './use-snapshot';

export interface HudProps {
  readonly session: Pick<Session, 'store' | 'setSkill'>;
  readonly onRunAgain: () => void;
}

/** Everything drawn over the scene (wiki/game/hud.md). Reads only the session's store. */
export function Hud({ session, onRunAgain }: HudProps) {
  const snapshot = useSnapshot(session.store);
  return (
    <div className={styles.hud}>
      <RunInfo snapshot={snapshot} />
      <Countdown snapshot={snapshot} />
      {snapshot.phase === 'result' && snapshot.pinsDown !== null ? (
        <EndScreen pinsDown={snapshot.pinsDown} impacts={snapshot.impacts} skill={snapshot.resultSkill ?? snapshot.skill} onRunAgain={onRunAgain} />
      ) : null}
      <SkillButtons active={snapshot.skill} onSelect={session.setSkill} />
    </div>
  );
}
