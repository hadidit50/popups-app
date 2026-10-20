'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_A11Y, readA11y, saveA11y, TEXT_STEPS, type A11yPrefs } from '@/lib/a11y-prefs';
import { useI18n } from '@/lib/i18n-client';
import { Icon, type IconName } from './Icon';
import { Link } from './Link';
import { Sheet } from './Sheet';
import styles from './AccessibilityMenu.module.css';

const TOGGLES: { key: 'contrast' | 'links' | 'font' | 'motion'; icon: IconName }[] = [
  { key: 'contrast', icon: 'contrast-circle' },
  { key: 'links', icon: 'link-variant' },
  { key: 'font', icon: 'format-font' },
  { key: 'motion', icon: 'motion-pause-outline' },
];

/** Header button that opens the accessibility settings: text size, contrast, links, font, motion. */
export function AccessibilityMenu() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_A11Y);
  useEffect(() => setPrefs(readA11y()), []);

  const update = (next: A11yPrefs) => {
    setPrefs(next);
    saveA11y(next);
  };
  const changed = JSON.stringify(prefs) !== JSON.stringify(DEFAULT_A11Y);

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)} aria-label={t('a11yMenu.open')} aria-haspopup="dialog">
        <Icon name="wheelchair-accessibility" size={24} />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t('a11yMenu.title')} description={t('a11yMenu.saved')}>
        <div className={styles.textRow} role="group" aria-labelledby="a11y-text-label">
          <span id="a11y-text-label" className={styles.textLabel}>
            <Icon name="format-size" size={22} />
            {t('a11yMenu.textSize')}
          </span>
          <button
            type="button"
            className={styles.stepper}
            onClick={() => update({ ...prefs, text: prefs.text - 1 })}
            disabled={prefs.text === 0}
            aria-label={t('a11yMenu.smaller')}
          >
            <Icon name="minus" size={22} />
          </button>
          <output className={styles.textValue} aria-live="polite">
            {TEXT_STEPS[prefs.text]}%
          </output>
          <button
            type="button"
            className={styles.stepper}
            onClick={() => update({ ...prefs, text: prefs.text + 1 })}
            disabled={prefs.text === TEXT_STEPS.length - 1}
            aria-label={t('a11yMenu.larger')}
          >
            <Icon name="plus" size={22} />
          </button>
        </div>

        <ul className={styles.toggles}>
          {TOGGLES.map((item) => (
            <li key={item.key}>
              <button type="button" className={styles.toggle} aria-pressed={prefs[item.key]} onClick={() => update({ ...prefs, [item.key]: !prefs[item.key] })}>
                <Icon name={item.icon} size={24} />
                <span className={styles.toggleLabel}>{t(`a11yMenu.${item.key}`)}</span>
                <span className={styles.state}>{prefs[item.key] ? t('a11yMenu.on') : t('a11yMenu.off')}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.footer}>
          <button type="button" className={styles.reset} onClick={() => update(DEFAULT_A11Y)} disabled={!changed}>
            <Icon name="restore" size={22} />
            {t('a11yMenu.reset')}
          </button>
          <Link href="/accessibility" className={styles.statement} onClick={() => setOpen(false)}>
            {t('a11yMenu.statement')}
          </Link>
        </div>
      </Sheet>
    </>
  );
}
