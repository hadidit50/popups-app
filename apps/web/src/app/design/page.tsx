import type { Metadata } from 'next';
import { Page } from '@/components/Page';
import { DesignPreview } from '@/features/dev/DesignPreview';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: t('preview.title'), robots: { index: false } };

export default function DesignPage() {
  return (
    <Page>
      <DesignPreview />
    </Page>
  );
}
