'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ButtonLink } from '@/components/Button';
import { Alert } from '@/components/Form';
import { PopupCardSkeleton } from '@/components/Skeleton';
import { PopupForm } from '@/features/editor/PopupForm';
import { t } from '@/lib/i18n';
import { emptyPopupForm, loadCities, loadPopupForm } from '@/lib/popup-editor';
import { SignedInGate } from './Gate';
import { useOrganizer } from './useOrganizer';

/** New / edit pop-up for organizers. New submissions always go to the approval queue. */
export function BusinessEditor({ mode }: { mode: 'new' | 'edit' }) {
  return (
    <SignedInGate next={mode === 'new' ? '/business/new' : '/business'} title={t('business.signInTitle')} body={t('business.signInBody')}>
      <Inner mode={mode} />
    </SignedInGate>
  );
}

function Inner({ mode }: { mode: 'new' | 'edit' }) {
  const router = useRouter();
  const id = useSearchParams().get('id');
  const organizer = useOrganizer();
  const cities = useQuery({ queryKey: ['cities'], queryFn: loadCities, staleTime: Infinity });
  const existing = useQuery({ queryKey: ['popup-form', id], queryFn: () => loadPopupForm(id!), enabled: mode === 'edit' && !!id });

  if (organizer.isPending || cities.isPending || (mode === 'edit' && existing.isPending)) return <PopupCardSkeleton />;
  if (organizer.error || cities.error || existing.error) return <Alert tone="error">{t('admin.loadFailed')}</Alert>;
  if (!organizer.data) {
    // No business profile yet: that step lives on /business.
    return (
      <ButtonLink href="/business" icon="store-plus-outline" fullWidth>
        {t('business.setupTitle')}
      </ButtonLink>
    );
  }
  if (mode === 'edit' && !existing.data) return <Alert tone="error">{t('details.notFoundTitle')}</Alert>;

  return (
    <PopupForm
      key={id ?? 'new'}
      initial={existing.data ?? emptyPopupForm()}
      cities={cities.data ?? []}
      mode="organizer"
      organizerId={organizer.data.id}
      onSaved={() => router.push(`/business?notice=${mode === 'new' ? 'submitted' : 'updated'}`)}
    />
  );
}
