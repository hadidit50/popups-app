import { I18nManager } from 'react-native';
import { reloadAppAsync } from 'expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RELOAD_KEY = 'wp.rtl-reload-at';

/**
 * The app is Hebrew-first and always right-to-left.
 * app.json already sets forcesRTL (native builds + Expo Go). This is a safety net:
 * if the native layer still started LTR, force RTL and reload once.
 * Resolves to true when a reload was triggered (render nothing until it happens).
 */
export async function ensureRTL(): Promise<boolean> {
  if (I18nManager.isRTL) return false;
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);

  // Never loop: reload at most once per minute.
  try {
    const last = Number(await AsyncStorage.getItem(RELOAD_KEY));
    if (last && Date.now() - last < 60_000) return false;
    await AsyncStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  await reloadAppAsync('Switching to right-to-left layout');
  return true;
}

/** Chevron that points "forward" in the current reading direction. */
export const forwardChevron = (): 'chevron-left' | 'chevron-right' =>
  I18nManager.isRTL ? 'chevron-left' : 'chevron-right';
