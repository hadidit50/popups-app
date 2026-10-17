'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { splitLangPath } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n-client';
import { Link } from './Link';
import styles from './SiteFooter.module.css';

const LINKS = ['accessibility', 'terms', 'privacy'] as const;

/** Accessibility statement, terms and privacy: reachable from every page (not on the full-screen map). */
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
        {LINKS.map((doc) => (
          <Link key={doc} href={`/${doc}`} className={styles.link}>
            {t(`legal.${doc}.title`)}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
