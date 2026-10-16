'use client';

import type { CSSProperties } from 'react';
import { CATEGORIES, type CategorySlug } from '@whats-poppin/shared';
import { useI18n } from '@/lib/i18n-client';
import { Icon, isIconName, type IconName } from './Icon';
import styles from './Chip.module.css';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onToggle: () => void;
  icon?: IconName;
  /** Icon color, and the fill when selected. */
  accent?: string;
}

/** Toggleable pill for filters ("פתוח עכשיו", "חינם", radius...). Announces its pressed state. */
export function FilterChip({ label, selected = false, onToggle, icon, accent = 'var(--color-primary)' }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={[styles.chip, selected && styles.selected].filter(Boolean).join(' ')}
      style={{ '--accent': accent } as CSSProperties}
    >
      {icon ? (
        <span className={styles.icon}>
          <Icon name={icon} size={20} />
        </span>
      ) : null}
      {label}
      {selected ? <Icon name="check" size={18} /> : null}
    </button>
  );
}

/** Category chip: icon + name in the category's color. `slug = null` means "All". */
export function CategoryChip({
  slug,
  selected,
  onToggle,
}: {
  slug: CategorySlug | null;
  selected?: boolean;
  onToggle: () => void;
}) {
  const { t } = useI18n();
  const meta = slug ? CATEGORIES[slug] : null;
  const icon = meta && isIconName(meta.icon) ? meta.icon : 'view-grid-outline';
  return (
    <FilterChip
      label={t(`categories.${slug ?? 'all'}`)}
      icon={icon}
      accent={meta?.color ?? 'var(--color-text)'}
      selected={selected}
      onToggle={onToggle}
    />
  );
}
