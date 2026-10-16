import type { Metadata } from 'next';
import { Page } from '@/components/Page';
import { DesignPreview } from '@/features/dev/DesignPreview';
import { getI18n } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t('preview.title'), robots: { index: false } };
}

export default function DesignPage() {
  return (
    <Page>
      <DesignPreview />
    </Page>
  );
}
