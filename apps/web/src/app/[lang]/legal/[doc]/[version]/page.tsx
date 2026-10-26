import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PopupCardSkeleton } from '@/components/Skeleton';
import { LegalPage } from '@/features/legal/LegalPage';
import { getI18n } from '@/lib/i18n-server';
import { isLegalDoc, LEGAL_DOCS, legalVersions } from '@/lib/legal';

type Params = { params: Promise<{ doc: string; version: string }> };

/** Every published version of every legal document stays available, e.g. /legal/terms/1. */
export function generateStaticParams() {
  return LEGAL_DOCS.flatMap((doc) => legalVersions(doc).map((v) => ({ doc, version: String(v) })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { t } = await getI18n();
  const { doc, version } = await params;
  return isLegalDoc(doc) ? { title: `${t(`legal.${doc}.title`)} · ${t('legal.versionLink', { version, date: '' }).replace(/\s*\(\)$/, '')}`, robots: { index: false } } : {};
}

export default function ArchivedLegalPage({ params }: Params) {
  return (
    <Suspense fallback={<PopupCardSkeleton />}>
      {params.then(({ doc, version }) => {
        const v = Number(version);
        if (!isLegalDoc(doc) || !legalVersions(doc).includes(v)) notFound();
        return <LegalPage doc={doc} version={v} />;
      })}
    </Suspense>
  );
}
