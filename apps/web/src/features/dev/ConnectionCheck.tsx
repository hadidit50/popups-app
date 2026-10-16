'use client';

import { useEffect, useState } from 'react';
import { Icon, type IconName } from '@/components/Icon';
import { useI18n } from '@/lib/i18n-client';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

type State = { kind: 'checking' } | { kind: 'ok'; count: number } | { kind: 'failed'; message: string } | { kind: 'notConfigured' };

/** Confirms the site can reach Supabase and read the live pop-ups. */
export function ConnectionCheck() {
  const { t } = useI18n();
  const [state, setState] = useState<State>(isSupabaseConfigured ? { kind: 'checking' } : { kind: 'notConfigured' });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase
      .from('popups')
      .select('id', { count: 'exact', head: true })
      .then(({ count, error }) => {
        setState(error ? { kind: 'failed', message: error.message } : { kind: 'ok', count: count ?? 0 });
      });
  }, []);

  const view: Record<State['kind'], { icon: IconName; color: string; text: string }> = {
    checking: { icon: 'progress-clock', color: 'var(--color-text-secondary)', text: t('health.checking') },
    notConfigured: { icon: 'alert-circle', color: 'var(--color-soon)', text: t('health.notConfigured') },
    ok: { icon: 'check-circle', color: 'var(--color-open)', text: state.kind === 'ok' ? t('health.ok', { count: state.count }) : '' },
    failed: { icon: 'alert-circle', color: 'var(--color-error)', text: state.kind === 'failed' ? t('health.failed', { message: state.message }) : '' },
  };
  const v = view[state.kind];

  return (
    <p role="status" className="t-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: v.color }}>
      <Icon name={v.icon} size={24} />
      <span>{v.text}</span>
    </p>
  );
}
