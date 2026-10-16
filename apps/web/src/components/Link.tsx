'use client';

import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { useI18n } from '@/lib/i18n-client';

/** next/link that keeps the visitor in their language: "/map" becomes "/ar/map" on Arabic pages. */
export function Link({ href, ...rest }: ComponentProps<typeof NextLink> & { href: string }) {
  const { href: localize } = useI18n();
  return <NextLink href={localize(href)} {...rest} />;
}
