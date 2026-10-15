'use client';

import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/Button';
import { Alert } from '@/components/Form';
import { PopupCardSkeleton } from '@/components/Skeleton';
import { StateView } from '@/components/StateView';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { isSupabaseConfigured } from '@/lib/supabase/client';

/** Shows children only to signed-in users; explains why sign-in is needed otherwise. */
export function SignedInGate({ next, title, body, children }: { next: string; title: string; body: string; children: ReactNode }) {
  const { user, loading } = useAuth();
  if (!isSupabaseConfigured) return <Alert tone="info">{t('auth.notConfigured')}</Alert>;
  if (loading) return <PopupCardSkeleton variant="row" />;
  if (!user) {
    return (
      <StateView
        icon="store-outline"
        title={title}
        body={body}
        action={
          <ButtonLink href={`/login?next=${encodeURIComponent(next)}`} icon="login" fullWidth>
            {t('auth.signIn')}
          </ButtonLink>
        }
      />
    );
  }
  return <>{children}</>;
}
