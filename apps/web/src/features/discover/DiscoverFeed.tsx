'use client';

import { useQuery } from '@tanstack/react-query';
import { ButtonLink } from '@/components/Button';
import { CardList, SectionNote } from '@/components/CardList';
import { CategoryRow, SearchBox } from '@/components/Discovery';
import { LocationPill, LocationPrompt } from '@/components/LocationControls';
import { SectionHeader } from '@/components/SectionHeader';
import { fetchDiscover } from '@/lib/data';
import { t } from '@/lib/i18n';
import { useLocation } from '@/lib/location';
import styles from './DiscoverFeed.module.css';

/** The home page: Hot now, Near you, This weekend, Ending soon — each card readable at a glance. */
export function DiscoverFeed() {
  const location = useLocation();
  const { place, state, ready } = location;
  const query = useQuery({
    queryKey: ['discover', place?.lat, place?.lng],
    queryFn: () => fetchDiscover(place),
    enabled: ready,
  });
  const loading = !ready || query.isPending;
  const common = { loading, error: query.error, onRetry: () => void query.refetch() };
  const needsLocation = state.kind === 'unset' || state.kind === 'denied' || state.kind === 'locating';

  return (
    <div className={styles.feed}>
      <header className={styles.header}>
        <h1 className="t-display">{t('discover.title')}</h1>
        <LocationPill />
      </header>

      <SearchBox />
      <CategoryRow />

      <Section id="hot" title={t('discover.hot')} seeAll="/list/hot">
        <CardList {...common} items={query.data?.hot} layout="carousel" surface="hot" empty={<SectionNote>{t('discover.sectionEmpty')}</SectionNote>} />
      </Section>

      <Section id="nearby" title={t('discover.nearby')} seeAll={place ? '/list/nearby' : undefined}>
        {needsLocation ? (
          <LocationPrompt />
        ) : state.kind === 'everywhere' ? null : (
          <>
            {query.data?.nearby_radius_km ? (
              <p className="t-meta t-secondary">{t('discover.nearbyRadius', { km: query.data.nearby_radius_km })}</p>
            ) : null}
            <CardList
              {...common}
              items={query.data?.nearby.slice(0, 5)}
              layout="rows"
              surface="nearby"
              skeletons={2}
              empty={<NearbyEmpty />}
            />
            {query.data && query.data.nearby.length > 5 ? (
              <ButtonLink href="/list/nearby" variant="secondary" icon="format-list-bulleted" fullWidth>
                {t('discover.seeAllNearby')}
              </ButtonLink>
            ) : null}
          </>
        )}
      </Section>

      <Section id="weekend" title={t('discover.weekend')} seeAll="/list/weekend">
        <CardList {...common} items={query.data?.weekend} layout="carousel" surface="weekend" empty={<SectionNote>{t('discover.sectionEmpty')}</SectionNote>} />
      </Section>

      <Section id="ending" title={t('discover.endingSoon')} seeAll="/list/ending-soon">
        <CardList {...common} items={query.data?.ending_soon} layout="carousel" surface="ending_soon" empty={<SectionNote>{t('discover.sectionEmpty')}</SectionNote>} />
      </Section>
    </div>
  );
}

function Section({ id, title, seeAll, children }: { id: string; title: string; seeAll?: string; children: React.ReactNode }) {
  return (
    <section className={styles.section} aria-labelledby={`sec-${id}`}>
      <SectionHeader id={`sec-${id}`} title={title} seeAllHref={seeAll} />
      {children}
    </section>
  );
}

function NearbyEmpty() {
  return (
    <div className={styles.nearbyEmpty}>
      <p className="t-heading">{t('discover.nearbyEmptyTitle')}</p>
      <p className="t-body t-secondary">{t('discover.nearbyEmptyBody')}</p>
    </div>
  );
}
