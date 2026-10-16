import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Page } from '@/components/Page';
import { LoginForm } from '@/features/auth/LoginForm';
import { getI18n } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t('auth.title'), robots: { index: false } };
}

export default async function LoginPage() {
  const { t } = await getI18n();
  return (
    <Page>
      <div style={{ display: 'grid', gap: 'var(--space-md)', maxWidth: '30rem', marginInline: 'auto' }}>
        <header style={{ display: 'grid', gap: 'var(--space-xxs)', paddingTop: 'var(--space-md)' }}>
          <h1 className="t-display">{t('auth.title')}</h1>
          <p className="t-body t-secondary">{t('auth.intro')}</p>
        </header>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </Page>
  );
}
