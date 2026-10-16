'use client';

import { Link } from '@/components/Link';
import { useI18n } from '@/lib/i18n-client';
import { Icon } from './Icon';

interface SectionHeaderProps {
  title: string;
  /** Shows a "הכל ›" link when provided. */
  seeAllHref?: string;
  id?: string;
}

export function SectionHeader({ title, seeAllHref, id }: SectionHeaderProps) {
  const { t, forward } = useI18n();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
      <h2 className="t-title" id={id}>
        {title}
      </h2>
      {seeAllHref ? (
        <Link
          href={seeAllHref}
          aria-label={`${t('common.seeAll')}: ${title}`}
          className="t-body-strong"
          style={{ display: 'inline-flex', alignItems: 'center', minHeight: 'var(--touch)', color: 'var(--color-primary)', whiteSpace: 'nowrap' }}
        >
          {t('common.seeAll')}
          <Icon name={forward} size={22} />
        </Link>
      ) : null}
    </div>
  );
}
