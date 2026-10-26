'use client';

import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { prefersLessMotion } from '@/lib/a11y-prefs';
import { splitLangPath } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n-client';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Sheet } from './Sheet';
import styles from './InstallHint.module.css';

// "Add to home screen": a small card docked at the side of the screen on phones. Chrome on Android
// gets the browser's own install prompt; iPhone and other browsers get three short steps.
// Hidden when the site already runs from the home screen, on the full-screen map, and for
// 30 days after the visitor closes it.

const KEY = 'wp.installHint.dismissedAt';
const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;
const DELAY_MS = 6000;

type Platform = 'ios' | 'android';
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
}

function dismissedRecently() {
  try {
    return Date.now() - Number(localStorage.getItem(KEY) || 0) < SNOOZE_MS;
  } catch {
    return false;
  }
}

export function InstallHint() {
  return (
    <Suspense fallback={null}>
      <InstallHintInner />
    </Suspense>
  );
}

function InstallHintInner() {
  const { t } = useI18n();
  const onMap = splitLangPath(usePathname() ?? '/').path === '/map';
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (isStandalone() || dismissedRecently()) return;
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const android = /Android/.test(ua);
    if (!ios && !android) return; // computers: nothing to add to a home screen
    setPlatform(ios ? 'ios' : 'android');
    setAnimate(!prefersLessMotion());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    const onInstalled = () => setVisible(false);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    const timer = window.setTimeout(() => setVisible(true), DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    setOpen(false);
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {}
  };

  const start = async () => {
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      setPrompt(null);
      if (outcome === 'accepted') setVisible(false);
      return;
    }
    setOpen(true);
  };

  if (!platform || !visible || onMap) return null;

  const steps: { icon: IconName; text: string }[] =
    platform === 'ios'
      ? [
          { icon: 'export-variant', text: t('install.iosStep1') },
          { icon: 'plus-box-outline', text: t('install.iosStep2') },
          { icon: 'check', text: t('install.step3') },
        ]
      : [
          { icon: 'dots-vertical', text: t('install.androidStep1') },
          { icon: 'plus-box-outline', text: t('install.androidStep2') },
          { icon: 'check', text: t('install.step3') },
        ];

  return (
    <>
      <aside className={[styles.hint, animate && styles.animate].filter(Boolean).join(' ')} aria-label={t('install.title')}>
        <button type="button" className={styles.open} onClick={() => void start()}>
          <span className={styles.tile} aria-hidden="true">
            <img src="/icon-192.png" alt="" width={40} height={40} />
            <span className={styles.badge}>
              <Icon name="plus" size={14} />
            </span>
          </span>
          <span className={styles.label}>{t('install.hint')}</span>
        </button>
        <button type="button" className={styles.close} onClick={dismiss} aria-label={t('install.dismiss')}>
          <Icon name="close" size={20} />
        </button>
      </aside>

      <Sheet open={open} onClose={() => setOpen(false)} title={t('install.title')} description={t('install.body')}>
        <ol className={styles.steps}>
          {steps.map((s, i) => (
            <li key={i} className={styles.step}>
              <span className={styles.stepIcon} aria-hidden="true">
                <Icon name={s.icon} size={22} />
              </span>
              <span className="t-body">{s.text}</span>
            </li>
          ))}
        </ol>
        <Button fullWidth onClick={dismiss}>
          {t('install.done')}
        </Button>
      </Sheet>
    </>
  );
}
