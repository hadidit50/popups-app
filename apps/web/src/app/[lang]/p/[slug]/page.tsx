import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Page } from '@/components/Page';
import { PopupCardSkeleton } from '@/components/Skeleton';
import { PopupDetailsView } from '@/features/popup/PopupDetailsView';
import { LOCALE_TAG } from '@/lib/i18n';
import { getI18n } from '@/lib/i18n-server';
import { getPopupBySlug } from '@/lib/server/popups';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { t, city, lang } = await getI18n();
  const { slug } = await params;
  const popup = await getPopupBySlug(slug);
  if (!popup) return { title: t('details.notFoundTitle') };
  const description = popup.short_description ?? popup.description?.slice(0, 160) ?? undefined;
  return {
    title: `${popup.title} · ${city(popup.city_slug, popup.city_name)}`,
    description,
    openGraph: {
      title: popup.title,
      description,
      images: popup.cover_image_url ? [{ url: popup.cover_image_url }] : undefined,
      type: 'article',
      locale: LOCALE_TAG[lang].replace('-', '_'),
    },
    robots: popup.status && popup.status !== 'approved' ? { index: false } : undefined,
  };
}

export default function PopupPage({ params }: Params) {
  return (
    <Page>
      <Suspense fallback={<PopupCardSkeleton />}>
        {params.then(({ slug }) => (
          <PopupContent slug={slug} />
        ))}
      </Suspense>
    </Page>
  );
}

async function PopupContent({ slug }: { slug: string }) {
  const popup = await getPopupBySlug(decodeURIComponent(slug));
  if (!popup) notFound();
  return <PopupDetailsView popup={popup} />;
}
