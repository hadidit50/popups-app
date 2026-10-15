'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { t } from '@/lib/i18n';
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
  const pathname = usePathname() ?? '/';
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
                      <Icon name={active ? tab.activeIcon : tab.icon} size={22} />
                      {t(tab.label)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      <nav className={styles.bottom} aria-label={t('common.mainNav')}>
        <ul className={styles.bottomList}>
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <li key={tab.href}>
                <Link href={tab.href} className={styles.tab} aria-current={active ? 'page' : undefined}>
                  <Icon name={active ? tab.activeIcon : tab.icon} size={28} />
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
