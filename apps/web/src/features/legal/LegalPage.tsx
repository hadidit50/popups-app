import { Fragment, type ReactNode } from 'react';
import { Link } from '@/components/Link';
import { Page } from '@/components/Page';
import { getI18n } from '@/lib/i18n-server';
import {
  companyLine,
  companyOwner,
  formatLegalDate,
  getLegalDoc,
  latestLegalVersion,
  LEGAL_EMAIL,
  legalVersions,
  type LegalDocId,
  type LegalDocument,
  type LegalItem,
} from '@/lib/legal';
import styles from './LegalPage.module.css';

/**
 * A legal document: version and date, a plain-language "In short", a clickable table of contents and
 * numbered sections. Documents not yet translated are shown in Hebrew (the binding text) with a note.
 */
export async function LegalPage({ doc: id, version }: { doc: LegalDocId; version?: number }) {
  const { t, lang } = await getI18n();
  const latest = latestLegalVersion(id);
  const found = getLegalDoc(id, version ?? latest, lang);
  if (!found) return null;
  const { doc, translated } = found;
  const archived = doc.version !== latest;
  const older = legalVersions(id).filter((v) => v !== doc.version);

  return (
    <Page>
      <article className={styles.doc}>
        <header className={styles.head}>
          <h1 className="t-display">{t(`legal.${id}.title`)}</h1>
          <p className="t-meta t-secondary">{t('legal.version', { version: doc.version, date: formatLegalDate(doc.updated) })}</p>
          {archived ? (
            <p className={styles.notice} role="note">
              {t('legal.archived')}{' '}
              <Link href={`/${id}`} className={styles.link}>
                {t('legal.currentVersion')}
              </Link>
            </p>
          ) : null}
          {!translated ? (
            <p className={styles.notice} role="note">
              {t('legal.hebrewOnly')}
            </p>
          ) : null}
        </header>

        <div lang={doc.lang} dir={doc.lang === 'en' ? 'ltr' : 'rtl'} className={styles.body}>
          {'sections' in doc ? <Structured doc={doc} summaryTitle={t('legal.summary')} tocTitle={t('legal.toc')} /> : <Legacy doc={doc} />}
        </div>

        {older.length ? (
          <nav aria-labelledby="legal-versions" className={styles.versions}>
            <h2 id="legal-versions" className="t-heading">
              {t('legal.previousVersions')}
            </h2>
            <ul>
              {older.map((v) => {
                const other = getLegalDoc(id, v, lang);
                return (
                  <li key={v}>
                    <Link href={v === latest ? `/${id}` : `/legal/${id}/${v}`} className={styles.link}>
                      {t('legal.versionLink', { version: v, date: other ? formatLegalDate(other.doc.updated) : '' })}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </article>
    </Page>
  );
}

function Structured({ doc, summaryTitle, tocTitle }: { doc: Extract<LegalDocument, { sections: unknown }>; summaryTitle: string; tocTitle: string }) {
  return (
    <>
      <section className={styles.summary} aria-labelledby="legal-summary">
        <h2 id="legal-summary" className="t-heading">
          {summaryTitle}
        </h2>
        <ul>
          {doc.summary.map((line, i) => (
            <li key={i}>{rich(line)}</li>
          ))}
        </ul>
      </section>

      <nav className={styles.toc} aria-labelledby="legal-toc">
        <h2 id="legal-toc" className="t-heading">
          {tocTitle}
        </h2>
        <ol>
          {doc.sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className={styles.link}>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {doc.sections.map((s, si) => (
        <section key={s.id} id={s.id} className={styles.section} aria-labelledby={`${s.id}-title`}>
          <h2 id={`${s.id}-title`} className="t-heading">
            {si + 1}. {s.title}
          </h2>
          {s.items.map((item, ii) => (
            <Item key={ii} number={`${si + 1}.${ii + 1}`} item={item} />
          ))}
        </section>
      ))}
    </>
  );
}

function Item({ number, item }: { number: string; item: LegalItem }) {
  const text = typeof item === 'string' ? item : item.text;
  return (
    <div className={styles.item}>
      <span className={styles.num} aria-hidden="true">
        {number}
      </span>
      <div>
        <p className="t-body">
          <span className="visually-hidden">{number} </span>
          {rich(text)}
        </p>
        {typeof item !== 'string' ? (
          <ul className={styles.list}>
            {item.list.map((li, i) => (
              <li key={i} className="t-body">
                {rich(li)}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function Legacy({ doc }: { doc: Extract<LegalDocument, { legacyBody: unknown }> }) {
  return (
    <>
      {doc.legacyBody.map((text, i) =>
        text.startsWith('## ') ? (
          <h2 key={i} className="t-heading">
            {text.slice(3)}
          </h2>
        ) : (
          <p key={i} className="t-body">
            {rich(text.replaceAll('{{date}}', formatLegalDate(doc.updated)))}
          </p>
        ),
      )}
    </>
  );
}

/** **bold**, and the {{email}} / {{company}} / {{owner}} placeholders. */
function rich(text: string): ReactNode {
  const filled = text.replaceAll('{{company}}', companyLine()).replaceAll('{{owner}}', companyOwner());
  return filled.split(/(\*\*[^*]+\*\*|\{\{email\}\})/).map((part, i) => {
    if (part === '{{email}}') {
      return (
        <a key={i} href={`mailto:${LEGAL_EMAIL}`} dir="ltr" className={styles.link}>
          {LEGAL_EMAIL}
        </a>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}
