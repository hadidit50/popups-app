'use client';

import { ButtonLink } from '@/components/Button';
import { Page } from '@/components/Page';
import { StateView } from '@/components/StateView';
import { useI18n } from '@/lib/i18n-client';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <Page>
      <StateView
        icon="map-search-outline"
        title={t('notFound.title')}
        body={t('notFound.body')}
        action={
          <ButtonLink href="/" icon="compass-outline" fullWidth>
            {t('notFound.action')}
          </ButtonLink>
        }
      />
    </Page>
  );
}
