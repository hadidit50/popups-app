import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { Page } from '@/components/Page';
import { ContactForm } from '@/features/contact/ContactForm';
import { getI18n } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t('contact.title'), description: t('contact.intro') };
}

export default async function ContactPage() {
  const { t } = await getI18n();
  return (
    <Page>
      <div style={{ display: 'grid', gap: 'var(--space-lg)', maxWidth: '40rem', marginInline: 'auto' }}>
        <header style={{ display: 'grid', gap: 'var(--space-xxs)', paddingTop: 'var(--space-md)' }}>
          <h1 className="t-display">{t('contact.title')}</h1>
          <p className="t-body t-secondary">{t('contact.intro')}</p>
          <p className="t-body-strong" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <Icon name="clock-outline" size={20} />
            {t('contact.promise')}
          </p>
        </header>
        <ContactForm />
      </div>
    </Page>
  );
}
