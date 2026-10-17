import type { Metadata } from 'next';
import { LegalPage } from '@/features/legal/LegalPage';
import { getI18n } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t('legal.privacy.title') };
}

export default function Page() {
  return <LegalPage doc="privacy" />;
}
