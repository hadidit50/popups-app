'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ButtonLink } from '@/components/Button';
import { CardList } from '@/components/CardList';
import { StateView } from '@/components/StateView';
import { NotificationSettings } from '@/features/notifications/NotificationSettings';
import { fetchList } from '@/lib/data';
import { useI18n } from '@/lib/i18n-client';
import { useLocation } from '@/lib/location';
import { pruneSaved, useSavedIds } from '@/lib/saved';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import styles from '../discover/DiscoverFeed.module.css';

/** Saved pop-ups, ending soonest first. Ended ones are cleaned up with a short note. */
export function SavedList() {
  const { t } = useI18n();
  const ids = useSavedIds();
  const { place } = useLocation();
  const [mounted, setMounted] = useState(false);
  const [pruned, setPruned] = useState(0);
  useEffect(() => {
    setMounted(true);
    void import('@/lib/saved-sync').then((m) => m.syncSaved());
  }, []);

  const key = useMemo(() => [...ids].sort().join(','), [ids]);
  const query = useQuery({
    queryKey: ['saved', key, place?.lat, place?.lng],
    queryFn: () => fetchList({ section: 'all', place, filters: { ids }, limit: 300 }),
    enabled: mounted && ids.length > 0,
  });

  useEffect(() => {
    if (!query.data) return;
    const removed = pruneSaved(new Set(query.data.map((p) => p.id)));
    if (removed) setPruned((n) => n + removed);
  }, [query.data]);

  const items = useMemo(
    () => (query.data ? [...query.data].sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime()) : undefined),
    [query.data],
  );

  const empty = (
    <StateView
      icon="heart-outline"
      title={t('saved.emptyTitle')}
      body={t('saved.emptyBody')}
      action={
        <ButtonLink href="/" icon="compass-outline" fullWidth>
          {t('saved.emptyAction')}
        </ButtonLink>
      }
    />
  );

  return (
    // One narrow column, like the profile: each heart stays next to its pop-up.
    <div className={styles.feed} style={{ maxWidth: '40rem', marginInline: 'auto' }}>
      <header style={{ display: 'grid', gap: 'var(--space-xxs)' }}>
        <h1 className="t-display">{t('saved.title')}</h1>
        <p className="t-body t-secondary">{t('saved.intro')}</p>
      </header>
      {pruned ? (
        <p className="t-body" role="status" style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)' }}>
          {pruned === 1 ? t('saved.prunedOne') : t('saved.pruned', { count: pruned })}
        </p>
      ) : null}
      {mounted && ids.length > 0 ? <NotificationSettings compact /> : null}
      {mounted && ids.length === 0 ? (
        empty
      ) : (
        <CardList
          items={items}
          loading={!mounted || query.isPending}
          error={query.error}
          onRetry={() => void query.refetch()}
          layout="rows"
          surface="saved"
          empty={empty}
        />
      )}
      {mounted && ids.length > 0 && !isSupabaseConfigured ? null : mounted && ids.length > 0 ? (
        <p className="t-meta t-secondary">{t('saved.localNote')}</p>
      ) : null}
    </div>
  );
}
