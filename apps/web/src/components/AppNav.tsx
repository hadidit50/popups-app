'use client';

import { Link } from '@/components/Link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { LANG_COOKIE, LANG_NAMES, LANGS, localePath, splitLangPath, type Lang } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n-client';
import { Icon, type IconName } from './Icon';
import styles from './AppNav.module.css';

const TABS: { href: string; label: string; icon: IconName; activeIcon: IconName }[] = [
  { href: '/', label: 'tabs.discover', icon: 'compass-outline', activeIcon: 'compass' },
  { href: '/map', label: 'tabs.map', icon: 'map-outline', activeIcon: 'map' },
  { href: '/saved', label: 'tabs.saved', icon: 'heart-outline', activeIcon: 'heart' },
  { href: '/profile', label: 'tabs.profile', icon: 'account-circle-outline', activeIcon: 'account-circle' },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

/** Exactly 4 destinations: bottom tab bar on phones, top links on wide screens. */
export function AppNav() {
  // The current URL isn't known while prerendering dynamic pages: render the nav without
  // an active tab first, then highlight the right one.
  return (
    <Suspense fallback={<AppNavView pathname="" />}>
      <AppNavWithPath />
    </Suspense>
  );
}

function AppNavWithPath() {
  return <AppNavView pathname={usePathname() ?? '/'} />;
}

function AppNavView({ pathname: fullPath }: { pathname: string }) {
  const { t } = useI18n();
  const pathname = fullPath ? splitLangPath(fullPath).path : '';
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo} aria-label={`${t('app.name')} – ${t('common.home')}`}>
            {/* The brand is Latin text: keep its word order inside the RTL page. */}
            <bdi dir="ltr">
              WHATS <span>POPPIN</span>
            </bdi>
          </Link>
          <nav aria-label={t('common.mainNav')}>
            <ul className={styles.topLinks}>
              {TABS.map((tab) => {
                const active = isActive(pathname, tab.href);
                return (
                  <li key={tab.href}>
                    <Link href={tab.href} className={styles.topLink} aria-current={active ? 'page' : undefined}>
                      <Icon name={active ? tab.activeIcon : tab.icon} size={20} />
                      {t(tab.label)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <LanguageLinks pathname={pathname} />
        </div>
      </header>

      <nav className={styles.bottom} aria-label={t('common.mainNav')}>
        <ul className={styles.bottomList}>
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <li key={tab.href}>
                <Link href={tab.href} className={styles.tab} aria-current={active ? 'page' : undefined}>
                  <Icon name={active ? tab.activeIcon : tab.icon} size={24} />
                  {t(tab.label)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

/**
 * One tap to switch language: the header always shows the *other* languages, each written in its
 * own script, so a visitor recognizes theirs without knowing the current one.
 */
function LanguageLinks({ pathname }: { pathname: string }) {
  const { t, lang: current } = useI18n();
  const pick = (lang: Lang) => {
    document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
    const { path } = splitLangPath(window.location.pathname);
    // Full page load: the whole page (text direction included) switches at once.
    window.location.assign(localePath(lang, path) + window.location.search);
  };
  return (
    <nav aria-label={t('language.label')} className={styles.langs}>
      <Icon name="web" size={20} />
      {LANGS.filter((l) => l !== current).map((lang) => (
        <a
          key={lang}
          href={localePath(lang, pathname || '/')}
          hrefLang={lang}
          lang={lang}
          className={styles.lang}
          onClick={(e) => {
            e.preventDefault();
            pick(lang);
          }}
        >
          {LANG_NAMES[lang]}
        </a>
      ))}
    </nav>
  );
}
