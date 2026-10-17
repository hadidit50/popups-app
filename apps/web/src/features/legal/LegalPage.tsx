import { Fragment } from 'react';
import { Page } from '@/components/Page';
import { CONTACT_EMAIL } from '@/lib/contact';
import { getI18n } from '@/lib/i18n-server';

export type LegalDoc = 'accessibility' | 'terms' | 'privacy';

/** Date shown as "last updated" on all three documents. Change it whenever their text changes. */
const UPDATED = '17.10.2026';


/**
 * Accessibility statement, terms and privacy policy. The text lives in the i18n files as a list of
 * paragraphs; a paragraph starting with "## " is a heading.
 */
export async function LegalPage({ doc }: { doc: LegalDoc }) {
  const { t, tList } = await getI18n();
  const paragraphs = tList(`legal.${doc}.body`);
  const email = CONTACT_EMAIL ? (
    <a href={`mailto:${CONTACT_EMAIL}`} dir="ltr" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
      {CONTACT_EMAIL}
    </a>
  ) : (
    t('legal.contactMissing')
  );

  return (
    <Page>
      <article style={{ display: 'grid', gap: 'var(--space-sm)', maxWidth: '44rem', marginInline: 'auto', paddingTop: 'var(--space-md)' }}>
        <h1 className="t-display" style={{ marginBottom: 'var(--space-sm)' }}>
          {t(`legal.${doc}.title`)}
        </h1>
        {paragraphs.map((text, i) =>
          text.startsWith('## ') ? (
            <h2 key={i} className="t-heading" style={{ marginTop: 'var(--space-md)' }}>
              {text.slice(3)}
            </h2>
          ) : (
            <p key={i} className="t-body">
              {text
                .replaceAll('{{date}}', UPDATED)
                .split('{{email}}')
                .map((part, j) => (
                  <Fragment key={j}>
                    {j > 0 ? email : null}
                    {part}
                  </Fragment>
                ))}
            </p>
          ),
        )}
      </article>
    </Page>
  );
}
