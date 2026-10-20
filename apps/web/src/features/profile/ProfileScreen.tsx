'use client';

import { Link } from '@/components/Link';
import { useEffect, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CATEGORY_LIST } from '@whats-poppin/shared';
import { Button, ButtonLink } from '@/components/Button';
import { FilterChip } from '@/components/Chip';
import { Alert, FormCard, SelectField } from '@/components/Form';
import { Icon, isIconName, type IconName } from '@/components/Icon';
import { ConnectionCheck } from '@/features/dev/ConnectionCheck';
import { NotificationSettings } from '@/features/notifications/NotificationSettings';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n-client';
import { loadCities } from '@/lib/popup-editor';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import styles from './ProfileScreen.module.css';

export function ProfileScreen() {
  const { t } = useI18n();
  const { user, isAdmin, loading } = useAuth();
  return (
    <div className={styles.screen}>
      <h1 className="t-display">{t('profile.title')}</h1>

      <section className={styles.account} aria-labelledby="account-title">
        <div className={styles.who}>
          <span className={styles.avatar}>
            <Icon name={user ? 'account-circle' : 'account-circle-outline'} size={32} />
          </span>
          <div className={styles.whoText}>
            <h2 id="account-title" className="t-heading">
              {user ? t('profile.account') : t('profile.guestTitle')}
            </h2>
            {user ? (
              <p className="t-body t-secondary" dir="auto">
                {t('auth.signedInAs', { email: user.email ?? '' })}
              </p>
            ) : (
              <p className="t-body t-secondary">{t('profile.guestBody')}</p>
            )}
          </div>
        </div>
        {user ? (
          <AccountActions />
        ) : isSupabaseConfigured && !loading ? (
          <ButtonLink href="/login?next=/profile" icon="login" fullWidth>
            {t('auth.signIn')}
          </ButtonLink>
        ) : null}
      </section>

      <LinkGroup title={t('profile.business')}>
        <LinkRow href="/promote" icon="rocket-launch-outline" title={t('promote.cardTitle')} body={t('promote.cardBody')} accent />
        <LinkRow href="/business" icon="store-plus-outline" title={t('profile.businessCta')} body={t('profile.businessBody')} />
      </LinkGroup>

      <NotificationSettings plain />
      {user ? <Preferences /> : null}

      <LinkGroup title={t('contact.profileTitle')}>
        <LinkRow href="/contact" icon="lifebuoy" title={t('contact.profileCta')} body={t('contact.profileBody')} />
        {isAdmin ? <LinkRow href="/admin" icon="shield-account-outline" title={t('profile.adminCta')} body={t('profile.admin')} /> : null}
      </LinkGroup>

      {/* Setup tools: for the site owner before the database is connected, then for admins only. */}
      {isAdmin || !isSupabaseConfigured ? (
        <>
          <hr className={styles.divider} />
          <section className={styles.system} aria-labelledby="system-check">
            <h2 id="system-check">{t('profile.devSection')}</h2>
            <ConnectionCheck />
            {!isSupabaseConfigured ? <p className="t-meta t-secondary">{t('common.demoMode')}</p> : null}
            <ButtonLink href="/design" variant="ghost" size="medium" icon="palette-swatch-outline">
              {t('profile.uiPreview')}
            </ButtonLink>
          </section>
        </>
      ) : null}
    </div>
  );
}

function LinkGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.group}>
      <h2 className={styles.groupTitle}>{title}</h2>
      <ul className={styles.list}>{children}</ul>
    </section>
  );
}

/** One settings row: icon, what it is, one line on why, and an arrow. The whole row is the link. */
function LinkRow({ href, icon, title, body, accent = false }: { href: string; icon: IconName; title: string; body: string; accent?: boolean }) {
  const { forward } = useI18n();
  return (
    <li className={accent ? styles.accent : undefined}>
      <Link href={href} className={styles.row}>
        <span className={styles.rowIcon}>
          <Icon name={icon} size={22} />
        </span>
        <span className={styles.rowText}>
          <span className={styles.rowTitle}>{title}</span>
          <span className={styles.rowBody}>{body}</span>
        </span>
        <span className={styles.chevron}>
          <Icon name={forward} size={22} />
        </span>
      </Link>
    </li>
  );
}

function AccountActions() {
  const { t } = useI18n();
  const { signOut } = useAuth();
  return (
    <Button variant="secondary" icon="logout" fullWidth onClick={() => void signOut()}>
      {t('auth.signOut')}
    </Button>
  );
}

function Preferences() {
  const { t, city } = useI18n();
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
    <FormCard title={t('profile.preferences')} plain>
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
            {city(c.slug, c.name_he)}
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
