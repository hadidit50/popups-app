'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { splitLangPath } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n-client';
import { Link } from './Link';
import styles from './SiteFooter.module.css';

const LINKS = [
  { href: '/contact', label: 'contact.title' },
  { href: '/accessibility', label: 'legal.accessibility.title' },
  { href: '/terms', label: 'legal.terms.title' },
  { href: '/privacy', label: 'legal.privacy.title' },
  { href: '/advertisers', label: 'legal.advertisers.title' },
];

/** Contact, accessibility statement, terms, privacy and the advertiser agreement: reachable from every page (not on the full-screen map). */
export function SiteFooter() {
  return (
    <Suspense fallback={null}>
      <FooterUnlessMap />
    </Suspense>
  );
}

function FooterUnlessMap() {
  const path = splitLangPath(usePathname() ?? '/').path;
  const { t } = useI18n();
  if (path === '/map') return null;
  return (
    <footer className={styles.footer}>
      <nav aria-label={t('legal.footerLabel')} className={styles.inner}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={styles.link}>
            {t(l.label)}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
