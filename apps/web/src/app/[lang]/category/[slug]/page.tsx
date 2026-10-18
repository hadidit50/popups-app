import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORY_SLUGS, type CategorySlug } from '@whats-poppin/shared';
import { CategoryRow } from '@/components/Discovery';
import { Page } from '@/components/Page';
import { PopupListView } from '@/features/discover/PopupListView';
import { getI18n } from '@/lib/i18n-server';

const isCategory = (slug: string): slug is CategorySlug => (CATEGORY_SLUGS as readonly string[]).includes(slug);

export function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { t } = await getI18n();
  const { slug } = await params;
  return { title: isCategory(slug) ? t(`categories.${slug}`) : undefined };
}

/** All live pop-ups in one category, nearest first. */
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { t } = await getI18n();
  const { slug } = await params;
  if (!isCategory(slug)) notFound();
  return (
    <Page>
      {/* minmax(0, 1fr): the scrolling category row must not widen the page. */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--space-md)' }}>
        <CategoryRow current={slug} />
        <PopupListView
          title={t(`categories.${slug}`)}
          intro={t('category.intro')}
          section="all"
          baseFilters={{ category: slug }}
          surface={`category_${slug}`}
        />
      </div>
    </Page>
  );
}
