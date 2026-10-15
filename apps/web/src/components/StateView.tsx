import type { ReactNode } from 'react';
import { t } from '@/lib/i18n';
import { Icon, type IconName } from './Icon';
import styles from './StateView.module.css';

interface StateViewProps {
  icon: IconName;
  title: string;
  body?: string;
  /** A button or link telling the visitor what to do next. */
  action?: ReactNode;
  tone?: 'neutral' | 'error';
}

/** Empty / error / placeholder state. Always says what happened and what to do next. */
export function StateView({ icon, title, body, action, tone = 'neutral' }: StateViewProps) {
  return (
    <div className={[styles.container, tone === 'error' && styles.error].filter(Boolean).join(' ')} role={tone === 'error' ? 'alert' : 'status'}>
      <div className={styles.circle}>
        <Icon name={icon} size={44} />
      </div>
      <h2 className="t-title">{title}</h2>
      {body ? <p className={`t-body ${styles.body}`}>{body}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}

/** Ready-made error state. Pass the retry button as `action`. */
export function ErrorState({ offline, action }: { offline?: boolean; action: ReactNode }) {
  return (
    <StateView
      tone="error"
      icon={offline ? 'wifi-off' : 'alert-circle-outline'}
      title={t(offline ? 'errors.offlineTitle' : 'errors.genericTitle')}
      body={t(offline ? 'errors.offlineBody' : 'errors.genericBody')}
      action={action}
    />
  );
}
