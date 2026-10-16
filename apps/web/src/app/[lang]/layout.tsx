import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
// Self-hosted fonts: Rubik (Hebrew + Latin) and Noto Sans Arabic. The browser downloads only the
// scripts a page actually uses.
import '@fontsource-variable/rubik/wght.css';
import '@fontsource-variable/noto-sans-arabic/wght.css';
import '../globals.css';
import { AppNav } from '@/components/AppNav';
import { Providers } from '@/components/Providers';
import { getTranslator, isLang, LANGS, localePath, LOCALE_TAG } from '@/lib/i18n';
import { I18nProvider } from '@/lib/i18n-client';
import { getLang } from '@/lib/i18n-server';

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = getTranslator(await getLang());
  return {
    title: { default: t('meta.title'), template: `%s · ${t('app.name')}` },
    description: t('meta.description'),
    applicationName: t('app.name'),
    appleWebApp: { capable: true, title: t('app.name'), statusBarStyle: 'default' },
    formatDetection: { telephone: false },
    openGraph: { locale: LOCALE_TAG[lang].replace('-', '_') },
    alternates: { languages: Object.fromEntries(LANGS.map((l) => [LOCALE_TAG[l], localePath(l, '/')])) },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Zoom stays enabled on purpose (accessibility).
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default async function RootLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const { t, dir } = getTranslator(lang);
  return (
    <html lang={lang} dir={dir}>
      <body>
        <a href="#main" className="skip-link">
          {t('common.skipToContent')}
        </a>
        <I18nProvider lang={lang}>
          <Providers>
            <AppNav />
            <main id="main">{children}</main>
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
