'use client';

import { useEffect, useState } from 'react';

/**
 * The current time, refreshed every minute. Null during server render and the first client
 * render, so statuses are always computed from the visitor's real clock (never a cached page).
 */
export function useNow(refreshMs = 60_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);
  return now;
}
