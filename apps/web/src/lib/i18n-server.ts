import { lang } from 'next/root-params';
import { DEFAULT_LANG, getTranslator, isLang, type I18n, type Lang } from './i18n';

/** The current page's language, for Server Components (from the /[lang] root segment). */
export async function getLang(): Promise<Lang> {
  const value = await lang();
  return isLang(value) ? value : DEFAULT_LANG;
}

/** const { t } = await getI18n(); */
export async function getI18n(): Promise<I18n> {
  return getTranslator(await getLang());
}
