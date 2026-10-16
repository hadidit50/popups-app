'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useI18n } from '@/lib/i18n-client';
import { Icon } from './Icon';
import styles from './Sheet.module.css';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Bottom sheet on phones, centered dialog on desktop. Built on <dialog>, so focus is trapped,
 * Esc closes it and screen readers announce it as a dialog.
 */
export function Sheet({ open, onClose, title, description, children }: SheetProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="sheet-title"
      onClose={onClose}
      onClick={(e) => {
        // Tap on the dimmed backdrop closes the sheet.
        if (e.target === ref.current) onClose();
      }}
    >
      <div className={styles.inner}>
        <div className={styles.handle} aria-hidden="true" />
        <div className={styles.header}>
          <div style={{ display: 'grid', gap: 'var(--space-xxs)' }}>
            <h2 id="sheet-title" className="t-title">
              {title}
            </h2>
            {description ? <p className="t-body t-secondary">{description}</p> : null}
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label={t('common.close')}>
            <Icon name="close" size={24} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
