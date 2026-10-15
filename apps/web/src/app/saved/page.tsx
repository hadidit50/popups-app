import type { Metadata } from 'next';
import { ButtonLink } from '@/components/Button';
import { Page } from '@/components/Page';
import { StateView } from '@/components/StateView';
import { t } from '@/lib/i18n';

export const metadata: Metadata = { title: t('tabs.saved') };

// Stage 1: the empty state. Saving + reminders arrive in stage 4.
export default function SavedPage() {
  return (
    <Page>
      <h1 className="visually-hidden">{t('tabs.saved')}</h1>
      <StateView
        icon="heart-outline"
        title={t('saved.emptyTitle')}
        body={t('saved.emptyBody')}
        action={
          <ButtonLink href="/" icon="compass-outline" fullWidth>
            {t('saved.emptyAction')}
          </ButtonLink>
        }
      />
    </Page>
  );
}
