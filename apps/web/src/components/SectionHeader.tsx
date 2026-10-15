import Link from 'next/link';
import { t } from '@/lib/i18n';
import { FORWARD_CHEVRON, Icon } from './Icon';

interface SectionHeaderProps {
  title: string;
  /** Shows a "הכל ›" link when provided. */
  seeAllHref?: string;
  id?: string;
}

export function SectionHeader({ title, seeAllHref, id }: SectionHeaderProps) {
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
          <Icon name={FORWARD_CHEVRON} size={22} />
        </Link>
      ) : null}
    </div>
  );
}
