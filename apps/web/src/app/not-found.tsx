import { ButtonLink } from '@/components/Button';
import { Page } from '@/components/Page';
import { StateView } from '@/components/StateView';
import { t } from '@/lib/i18n';

export default function NotFound() {
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
