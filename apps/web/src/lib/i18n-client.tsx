'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_LANG, getTranslator, type I18n, type Lang } from './i18n';

const I18nContext = createContext<I18n>(getTranslator(DEFAULT_LANG));

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <I18nContext.Provider value={getTranslator(lang)}>{children}</I18nContext.Provider>;
}

/** const { t, href } = useI18n(); */
export function useI18n(): I18n {
  return useContext(I18nContext);
}
