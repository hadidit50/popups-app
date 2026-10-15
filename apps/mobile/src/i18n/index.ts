import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import he from '@whats-poppin/shared/src/i18n/he.json';
import en from '@whats-poppin/shared/src/i18n/en.json';

// Hebrew is the only UI language at launch (the app is forced RTL).
// To add a language: add locales/<code>.json and list it here; strings never live in components.
export const DEFAULT_LANGUAGE = 'he';

void i18n.use(initReactI18next).init({
  resources: { he: { translation: he }, en: { translation: en } },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: 'he',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
