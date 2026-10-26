import { PIN_NUMBERS, type PinNumber } from '@models/measures/pins';
import { useTranslation } from 'react-i18next';
import styles from './PinDiagram.module.css';

export interface PinDiagramProps {
  readonly down: readonly PinNumber[];
}

/** The ten pins as a bowling scoreboard draws them: standing solid, down hollow, each numbered (rule 4). */
export function PinDiagram({ down }: PinDiagramProps) {
  const { t } = useTranslation();
  return (
    <ul className={styles.diagram} aria-label={t('end.pins')}>
      {PIN_NUMBERS.map((pin) => {
        const isDown = down.includes(pin);
        const state = t(isDown ? 'end.pinDown' : 'end.pinStanding');
        return (
          <li key={pin} className={`${styles.pin} ${styles[`p${pin}`] ?? ''} ${isDown ? styles.down : styles.standing}`} aria-label={t('end.pin', { pin, state })}>
            {String(pin)}
          </li>
        );
      })}
    </ul>
  );
}
