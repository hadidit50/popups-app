'use client';

import { useCallback, useSyncExternalStore } from 'react';

// Saved pop-ups live in this browser right away (no sign-up needed).
// Stage 4 adds syncing to the visitor's anonymous Supabase session for reminders.
const KEY = 'wp.saved';
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[];
  } catch {
    cache = [];
  }
  return cache;
}

function write(ids: string[]) {
  cache = ids;
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

const EMPTY: string[] = [];

export function getSavedIds(): string[] {
  return read();
}

export function setSaved(id: string, saved: boolean) {
  const ids = read();
  if (saved && !ids.includes(id)) write([id, ...ids]);
  if (!saved && ids.includes(id)) write(ids.filter((x) => x !== id));
}

export function useSavedIds(): string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useIsSaved(id: string): [boolean, (next?: boolean) => void] {
  const ids = useSavedIds();
  const saved = ids.includes(id);
  const toggle = useCallback((next?: boolean) => setSaved(id, next ?? !saved), [id, saved]);
  return [saved, toggle];
}
