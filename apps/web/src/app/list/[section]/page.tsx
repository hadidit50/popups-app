import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ListSection } from '@whats-poppin/shared';
import { Page } from '@/components/Page';
import { PopupListView } from '@/features/discover/PopupListView';
import { t } from '@/lib/i18n';

const SECTIONS: Record<string, ListSection> = {
  hot: 'hot',
  nearby: 'nearby',
  weekend: 'weekend',
  'ending-soon': 'ending_soon',
};

export function generateStaticParams() {
  return Object.keys(SECTIONS).map((section) => ({ section }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  return { title: SECTIONS[section] ? t(`list.titles.${section}`) : undefined };
}

/** "See all" for a home-page section. */
export default async function ListPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: key } = await params;
  const section = SECTIONS[key];
  if (!section) notFound();
  return (
    <Page>
      <PopupListView
        title={t(`list.titles.${key}`)}
        section={section}
        surface={`list_${section}`}
        requiresLocation={section === 'nearby'}
        radiusKm={section === 'nearby' ? 25 : undefined}
        hideFilters={section === 'weekend' ? ['this_weekend', 'today'] : []}
      />
    </Page>
  );
}
