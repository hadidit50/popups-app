'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ListFilters, ListSection } from '@whats-poppin/shared';
import { ButtonLink } from '@/components/Button';
import { CardList } from '@/components/CardList';
import { QuickFilters, type QuickFilter } from '@/components/Discovery';
import { LocationPill, LocationPrompt } from '@/components/LocationControls';
import { StateView } from '@/components/StateView';
import { fetchList } from '@/lib/data';
import { useI18n } from '@/lib/i18n-client';
import { useLocation } from '@/lib/location';
import styles from './DiscoverFeed.module.css';

interface PopupListViewProps {
  title: string;
  intro?: string;
  section: ListSection;
  baseFilters?: ListFilters;
  surface: string;
  hideFilters?: QuickFilter[];
  /** "Near you" makes no sense without a location: ask for one first. */
  requiresLocation?: boolean;
  radiusKm?: number;
}

/** A full list ("see all", category, search results) with quick filters and all list states. */
export function PopupListView({ title, intro, section, baseFilters = {}, surface, hideFilters, requiresLocation, radiusKm }: PopupListViewProps) {
  const { t } = useI18n();
  const { place, ready } = useLocation();
  const [filters, setFilters] = useState<ListFilters>({});
  const merged = { ...baseFilters, ...filters };
  const enabled = ready && (!requiresLocation || !!place);
  const query = useQuery({
    queryKey: ['list', section, place?.lat, place?.lng, radiusKm, merged],
    queryFn: () => fetchList({ section, place, radiusKm, filters: merged, limit: 60 }),
    enabled,
  });
  const anyFilter = Object.values(filters).some(Boolean);
  const count = query.data?.length ?? 0;

  return (
    <div className={styles.feed}>
      <header className={styles.header}>
        <div style={{ display: 'grid', gap: 'var(--space-xxs)' }}>
          <h1 className="t-display">{title}</h1>
          {intro ? <p className="t-body t-secondary">{intro}</p> : null}
        </div>
        <LocationPill />
      </header>

      {requiresLocation && ready && !place ? (
        <LocationPrompt />
      ) : (
        <>
          <QuickFilters value={filters} onChange={setFilters} hide={hideFilters} />
          {query.data ? (
            <p className="t-meta t-secondary" role="status">
              {count === 1 ? t('list.countOne') : t('list.count', { count })}
            </p>
          ) : null}
          <CardList
            items={query.data}
            loading={!enabled || query.isPending}
            error={query.error}
            onRetry={() => void query.refetch()}
            layout="grid"
            surface={surface}
            skeletons={4}
            empty={
              <StateView
                icon="map-search-outline"
                title={t('list.emptyTitle')}
                body={anyFilter ? t('list.emptyFiltered') : t('list.emptyBody')}
                action={
                  <ButtonLink href="/" icon="compass-outline" fullWidth>
                    {t('list.backHome')}
                  </ButtonLink>
                }
              />
            }
          />
        </>
      )}
    </div>
  );
}
