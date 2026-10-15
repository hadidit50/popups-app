import type { Metadata } from 'next';
import { ButtonLink } from '@/components/Button';
import { Page } from '@/components/Page';
import { StateView } from '@/components/StateView';
import { ConnectionCheck } from '@/features/dev/ConnectionCheck';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: t('tabs.profile') };

// Stage 1 placeholder + a system check. Preferences, notifications and "Submit a pop-up" arrive in stages 6–8.
export default function ProfilePage() {
  return (
    <Page>
      <h1 className="visually-hidden">{t('tabs.profile')}</h1>
      <StateView icon="account-cog-outline" title={t('profile.placeholderTitle')} body={t('profile.placeholderBody')} />
      <section
        aria-labelledby="system-check"
        style={{ display: 'grid', gap: 'var(--space-sm)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', maxWidth: '34rem', marginInline: 'auto' }}
      >
        <h2 id="system-check" className="t-heading">
          {t('profile.devSection')}
        </h2>
        <ConnectionCheck />
        <ButtonLink href="/design" variant="secondary" icon="palette-swatch-outline" fullWidth>
          {t('profile.uiPreview')}
        </ButtonLink>
      </section>
    </Page>
  );
}
