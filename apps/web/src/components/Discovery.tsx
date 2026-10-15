'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type CSSProperties } from 'react';
import { CATEGORY_LIST, type ListFilters } from '@whats-poppin/shared';
import { t } from '@/lib/i18n';
import { FilterChip } from './Chip';
import { Icon, isIconName } from './Icon';
import styles from './Discovery.module.css';

/** Category shortcuts: each opens that category's page. */
export function CategoryRow({ current }: { current?: string }) {
  return (
    <nav aria-label={t('discover.categoriesLabel')}>
      <ul className={styles.chipRow}>
        {CATEGORY_LIST.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/category/${c.slug}`}
              className={styles.chipLink}
              aria-current={current === c.slug ? 'page' : undefined}
              style={{ '--accent': c.color } as CSSProperties}
            >
              <span className={styles.chipIcon}>{isIconName(c.icon) ? <Icon name={c.icon} size={20} /> : null}</span>
              {t(`categories.${c.slug}`)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Search field. Submitting opens /search?q=… */
export function SearchBox({ initial = '' }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  return (
    <form
      role="search"
      className={styles.search}
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim();
        if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
      }}
    >
      <label className={styles.searchField}>
        <span className="visually-hidden">{t('discover.searchLabel')}</span>
        <span className={styles.searchIcon}>
          <Icon name="magnify" size={24} />
        </span>
        <input
          className={styles.searchInput}
          type="search"
          enterKeyHint="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('discover.searchPlaceholder')}
        />
      </label>
      <button type="submit" className={styles.searchButton}>
        {t('discover.searchButton')}
      </button>
    </form>
  );
}

export type QuickFilter = 'open_now' | 'today' | 'this_weekend' | 'free_only';
const QUICK_FILTERS: { key: QuickFilter; label: string; icon: 'clock-outline' | 'calendar-clock' | 'calendar-weekend' | 'ticket-outline' }[] = [
  { key: 'open_now', label: 'filters.openNow', icon: 'clock-outline' },
  { key: 'today', label: 'filters.today', icon: 'calendar-clock' },
  { key: 'this_weekend', label: 'filters.weekend', icon: 'calendar-weekend' },
  { key: 'free_only', label: 'filters.free', icon: 'ticket-outline' },
];

/** "פתוח עכשיו / היום / בסופ״ש / חינם" toggles. */
export function QuickFilters({
  value,
  onChange,
  hide = [],
}: {
  value: ListFilters;
  onChange: (next: ListFilters) => void;
  hide?: QuickFilter[];
}) {
  return (
    <div className={styles.filters} role="group" aria-label={t('list.filtersLabel')}>
      {QUICK_FILTERS.filter((f) => !hide.includes(f.key)).map((f) => (
        <FilterChip
          key={f.key}
          label={t(f.label)}
          icon={f.icon}
          selected={!!value[f.key]}
          onToggle={() => onChange({ ...value, [f.key]: !value[f.key] })}
        />
      ))}
    </div>
  );
}
