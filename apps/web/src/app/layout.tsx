import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
// Self-hosted Rubik (Hebrew + Latin). The browser downloads only the scripts a page uses.
import '@fontsource-variable/rubik/wght.css';
import './globals.css';
import { AppNav } from '@/components/AppNav';
import { Providers } from '@/components/Providers';
import { t } from '@/lib/i18n';

export const metadata: Metadata = {
  title: { default: t('meta.title'), template: `%s · ${t('app.name')}` },
  description: t('meta.description'),
  applicationName: t('app.name'),
  appleWebApp: { capable: true, title: t('app.name'), statusBarStyle: 'default' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Zoom stays enabled on purpose (accessibility).
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <a href="#main" className="skip-link">
          {t('common.skipToContent')}
        </a>
        <Providers>
          <AppNav />
          <main id="main">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
