'use client';

import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n-client';
import { Icon } from './Icon';

/**
 * Until the database is connected the site shows built-in sample pop-ups. Say so on every page,
 * so nobody mistakes them for real events.
 */
export function SampleNotice() {
  const { t } = useI18n();
  if (isSupabaseConfigured) return null;
  return (
    <p
      role="note"
      className="t-meta-strong"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-xs)',
        padding: 'var(--space-xs) var(--gutter)',
        background: 'var(--color-sponsored-soft)', color: 'var(--color-sponsored)', textAlign: 'center',
      }}
    >
      <Icon name="information-outline" size={20} />
      {t('common.sampleNotice')}
    </p>
  );
}
