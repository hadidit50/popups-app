'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CATEGORY_SLUGS, type CategorySlug } from '@whats-poppin/shared';
import { ButtonLink } from '@/components/Button';
import { CardList } from '@/components/CardList';
import { SearchBox } from '@/components/Discovery';
import { StateView } from '@/components/StateView';
import { fetchList } from '@/lib/data';
import { getTranslator, LANGS } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n-client';
import { AdvertiserDisclaimer } from '@/features/legal/AdvertiserNotes';
import { useLocation } from '@/lib/location';
import styles from './DiscoverFeed.module.css';

/** Categories whose name in any of our languages matches the query, e.g. "אוכל" / "طعام" / "food" → food. */
function matchCategories(q: string): CategorySlug[] {
  const needle = q.trim().toLowerCase();
  if (needle.length < 2) return [];
  return CATEGORY_SLUGS.filter((slug) =>
    LANGS.some((lang) => {
      const name = getTranslator(lang).t(`categories.${slug}`).toLowerCase();
      return name.includes(needle) || needle.includes(name) || slug.includes(needle);
    }),
  );
}

export function SearchResults() {
  const { t } = useI18n();
  const q = useSearchParams().get('q')?.trim() ?? '';
  const { place, ready } = useLocation();
  const query = useQuery({
    queryKey: ['search', q, place?.lat, place?.lng],
    queryFn: () => fetchList({ section: 'all', place, filters: { query: q, categories: matchCategories(q) }, limit: 60 }),
    enabled: ready && q.length > 0,
  });

  return (
    <div className={styles.feed}>
      <h1 className="t-display">{t('search.title')}</h1>
      <SearchBox key={q} initial={q} />
      {q ? (
        <>
          <h2 className="t-heading" role="status">
            {t('search.results', { q })}
          </h2>
          <AdvertiserDisclaimer />
          <CardList
            items={query.data}
            loading={!ready || query.isPending}
            error={query.error}
            onRetry={() => void query.refetch()}
            layout="grid"
            surface="search"
            empty={
              <StateView
                icon="magnify"
                title={t('search.emptyTitle', { q })}
                body={t('search.emptyBody')}
                action={
                  <ButtonLink href="/" icon="compass-outline" fullWidth>
                    {t('list.backHome')}
                  </ButtonLink>
                }
              />
            }
          />
        </>
      ) : (
        <p className="t-body t-secondary">{t('search.hint')}</p>
      )}
    </div>
  );
}
