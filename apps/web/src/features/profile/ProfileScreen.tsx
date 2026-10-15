'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CATEGORY_LIST } from '@whats-poppin/shared';
import { Button, ButtonLink } from '@/components/Button';
import { FilterChip } from '@/components/Chip';
import { Alert, FormCard, SelectField } from '@/components/Form';
import { isIconName } from '@/components/Icon';
import { ConnectionCheck } from '@/features/dev/ConnectionCheck';
import { NotificationSettings } from '@/features/notifications/NotificationSettings';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { loadCities } from '@/lib/popup-editor';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

export function ProfileScreen() {
  const { user, isAdmin, loading } = useAuth();
  return (
    <div style={{ display: 'grid', gap: 'var(--space-lg)', maxWidth: '40rem', marginInline: 'auto' }}>
      <h1 className="t-display" style={{ paddingTop: 'var(--space-md)' }}>
        {t('profile.title')}
      </h1>

      <FormCard title={user ? t('profile.account') : t('profile.guestTitle')}>
        {user ? (
          <>
            <p className="t-body" dir="auto">
              {t('auth.signedInAs', { email: user.email ?? '' })}
            </p>
            <AccountActions />
          </>
        ) : (
          <>
            <p className="t-body">{t('profile.guestBody')}</p>
            {isSupabaseConfigured && !loading ? (
              <ButtonLink href="/login?next=/profile" icon="login" fullWidth>
                {t('auth.signIn')}
              </ButtonLink>
            ) : null}
          </>
        )}
      </FormCard>

      {user ? <Preferences /> : null}
      <NotificationSettings />

      <FormCard title={t('profile.business')}>
        <p className="t-body">{t('profile.businessBody')}</p>
        <ButtonLink href="/business" variant="secondary" icon="store-plus-outline" fullWidth>
          {t('profile.businessCta')}
        </ButtonLink>
      </FormCard>

      {isAdmin ? (
        <FormCard title={t('profile.admin')}>
          <ButtonLink href="/admin" icon="shield-account-outline" fullWidth>
            {t('profile.adminCta')}
          </ButtonLink>
        </FormCard>
      ) : null}

      <section style={{ display: 'grid', gap: 'var(--space-sm)' }} aria-labelledby="system-check">
        <h2 id="system-check" className="t-heading">
          {t('profile.devSection')}
        </h2>
        <ConnectionCheck />
        {!isSupabaseConfigured ? <p className="t-meta t-secondary">{t('common.demoMode')}</p> : null}
        <ButtonLink href="/design" variant="ghost" size="medium" icon="palette-swatch-outline">
          {t('profile.uiPreview')}
        </ButtonLink>
      </section>
    </div>
  );
}

function AccountActions() {
  const { signOut } = useAuth();
  return (
    <Button variant="secondary" icon="logout" onClick={() => void signOut()}>
      {t('auth.signOut')}
    </Button>
  );
}

function Preferences() {
  const { profile, user, refreshProfile } = useAuth();
  const cities = useQuery({ queryKey: ['cities'], queryFn: loadCities, staleTime: Infinity });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [homeCity, setHomeCity] = useState<string>('');
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    setFavorites(profile?.favorite_categories ?? []);
    setHomeCity(profile?.home_city_id ? String(profile.home_city_id) : '');
  }, [profile]);

  const save = async () => {
    setState('saving');
    const { error } = await getSupabaseBrowserClient()!
      .from('profiles')
      .update({ favorite_categories: favorites, home_city_id: homeCity ? Number(homeCity) : null })
      .eq('id', user!.id);
    setState(error ? 'error' : 'saved');
    if (!error) await refreshProfile();
  };

  return (
    <FormCard title={t('profile.preferences')}>
      <fieldset style={{ border: 'none', display: 'grid', gap: 'var(--space-xs)' }}>
        <legend className="t-body-strong">{t('profile.favoriteCategories')}</legend>
        <p className="t-meta t-secondary">{t('profile.favoriteCategoriesHint')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)' }}>
          {CATEGORY_LIST.map((c) => (
            <FilterChip
              key={c.slug}
              label={t(`categories.${c.slug}`)}
              icon={isIconName(c.icon) ? c.icon : undefined}
              accent={c.color}
              selected={favorites.includes(c.slug)}
              onToggle={() => {
                setState('idle');
                setFavorites((f) => (f.includes(c.slug) ? f.filter((x) => x !== c.slug) : [...f, c.slug]));
              }}
            />
          ))}
        </div>
      </fieldset>
      <SelectField
        label={t('profile.homeArea')}
        optional
        value={homeCity}
        onChange={(e) => {
          setState('idle');
          setHomeCity(e.target.value);
        }}
      >
        <option value="">{t('profile.homeAreaNone')}</option>
        {(cities.data ?? []).map((c) => (
          <option key={c.id} value={c.id}>
            {c.name_he}
          </option>
        ))}
      </SelectField>
      <Button icon="check-bold" loading={state === 'saving'} onClick={() => void save()}>
        {state === 'saved' ? t('profile.saved') : t('profile.save')}
      </Button>
      {state === 'error' ? <Alert tone="error">{t('admin.loadFailed')}</Alert> : null}
    </FormCard>
  );
}
