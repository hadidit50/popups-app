import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';

const KEY = 'wp.session-id';
let cached: string | null = null;

/**
 * Anonymous, random per-install id. Lets us de-duplicate views for the "Hot now" score
 * without requiring login. Contains no personal data.
 */
export async function getSessionId(): Promise<string> {
  if (cached) return cached;
  try {
    cached = (await AsyncStorage.getItem(KEY)) ?? null;
    if (!cached) {
      cached = randomUUID();
      await AsyncStorage.setItem(KEY, cached);
    }
  } catch {
    cached = cached ?? randomUUID();
  }
  return cached;
}
