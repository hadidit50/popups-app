import type { MetadataRoute } from 'next';
import { DEFAULT_LANG, getTranslator } from '@/lib/i18n';

const { t } = getTranslator(DEFAULT_LANG);

/** Lets visitors "Add to Home Screen" and open the site like an app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: t('app.name'),
    short_name: t('app.name'),
    description: t('meta.description'),
    lang: 'he',
    dir: 'rtl',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
