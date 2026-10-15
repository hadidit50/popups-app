import { ButtonLink } from '@/components/Button';
import { Page } from '@/components/Page';
import { StateView } from '@/components/StateView';
import { t } from '@/lib/i18n';

// Stage 1 placeholder. The real feed (Hot now, Near me, This weekend, Ending soon) arrives in stage 2.
export default function DiscoverPage() {
  return (
    <Page>
      <section style={{ display: 'grid', gap: 'var(--space-xxs)', paddingBlock: 'var(--space-md)' }}>
        <h1 className="t-display">{t('discover.title')}</h1>
        <p className="t-body t-secondary">{t('app.tagline')}</p>
      </section>
      <StateView
        icon="party-popper"
        title={t('discover.placeholderTitle')}
        body={t('discover.placeholderBody')}
        action={
          <ButtonLink href="/design" icon="palette-swatch-outline" fullWidth>
            {t('discover.openPreview')}
          </ButtonLink>
        }
      />
    </Page>
  );
}
