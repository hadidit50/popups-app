'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useI18n } from './i18n-client';

/** useRouter() whose push/replace stay in the current language. */
export function useLocalRouter() {
  const router = useRouter();
  const { href } = useI18n();
  return useMemo(
    () => ({
      ...router,
      push: (path: string) => router.push(href(path)),
      replace: (path: string) => router.replace(href(path)),
    }),
    [router, href],
  );
}
