'use client';

import type { PopupStatusText } from '@/lib/status';
import { Icon } from './Icon';
import styles from './StatusLine.module.css';

/** "● פתוח עכשיו · עד 22:00   ⏳ יום אחרון!" — always words; color only reinforces. */
export function StatusLine({ text }: { text: PopupStatusText | null }) {
  if (!text) return <div className={styles.row} aria-hidden="true"><span className={styles.placeholder} /></div>;
  const tone = text.status.primary.tone;
  return (
    <div className={styles.row}>
      <span className={`${styles.item} ${styles[tone]}`}>
        <span className={styles.dot} aria-hidden="true" />
        {text.primary}
      </span>
      {text.ending ? (
        <span className={`${styles.item} ${styles.soon}`}>
          <Icon name="timer-sand" size={16} />
          {text.ending}
        </span>
      ) : null}
    </div>
  );
}
