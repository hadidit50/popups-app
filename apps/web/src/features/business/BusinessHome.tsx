'use client';

import { Link } from '@/components/Link';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, ButtonLink } from '@/components/Button';
import { Alert, FormCard, TextField } from '@/components/Form';
import { Icon } from '@/components/Icon';
import { PopupCardSkeleton } from '@/components/Skeleton';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { SignedInGate } from './Gate';
import { useOrganizer } from './useOrganizer';
import styles from './Business.module.css';

interface OwnPopup {
  id: string;
  slug: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  needs_review: boolean;
  rejection_reason: string | null;
  ends_at: string;
}

export function BusinessHome({ notice }: { notice?: 'submitted' | 'updated' | null }) {
  const { t } = useI18n();
  return (
    <SignedInGate next="/business" title={t('business.signInTitle')} body={t('business.signInBody')}>
      <BusinessInner notice={notice} />
    </SignedInGate>
  );
}

function BusinessInner({ notice }: { notice?: 'submitted' | 'updated' | null }) {
  const { t } = useI18n();
  const organizer = useOrganizer();
  if (organizer.isPending) return <PopupCardSkeleton variant="row" />;
  if (organizer.error) return <Alert tone="error">{t('admin.loadFailed')}</Alert>;
  if (!organizer.data) return <SetupBusiness />;
  return (
    <div className={styles.stack}>
      {notice ? <Alert tone="ok">{t(`business.${notice}`)}</Alert> : null}
      <div className={styles.headRow}>
        <h2 className="t-title">{t('business.myPopups')}</h2>
        <ButtonLink href="/business/new" icon="plus" size="medium">
          {t('business.newPopup')}
        </ButtonLink>
      </div>
      <OwnPopups organizerId={organizer.data.id} />
      <p className="t-meta t-secondary">{t('business.proTeaser')}</p>
    </div>
  );
}

function SetupBusiness() {
  const { t } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (name.trim().length < 2) {
      setError(t('form.required'));
      return;
    }
    setBusy(true);
    const { error: err } = await getSupabaseBrowserClient()!
      .from('organizers')
      .insert({ owner_id: user!.id, name: name.trim(), contact_phone: phone.trim() || null, contact_email: user!.email, instagram_url: instagram.trim() || null });
    setBusy(false);
    if (err) setError(t('form.saveFailed', { message: err.message }));
    else await qc.invalidateQueries({ queryKey: ['organizer'] });
  };

  return (
    <FormCard title={t('business.setupTitle')}>
      <p className="t-body t-secondary">{t('business.setupBody')}</p>
      <form
        style={{ display: 'grid', gap: 'var(--space-md)' }}
        onSubmit={(e) => {
          e.preventDefault();
          void create();
        }}
      >
        <TextField label={t('business.name')} value={name} onChange={(e) => setName(e.target.value)} error={error} autoComplete="organization" />
        <TextField label={t('business.phone')} type="tel" dir="ltr" optional value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
        <TextField label={t('form.instagram')} type="url" dir="ltr" optional value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        <Button type="submit" loading={busy} fullWidth icon="store-plus-outline">
          {t('business.createBusiness')}
        </Button>
      </form>
    </FormCard>
  );
}

function OwnPopups({ organizerId }: { organizerId: string }) {
  const { t } = useI18n();
  const query = useQuery({
    queryKey: ['own-popups', organizerId],
    queryFn: async () => {
      const { data, error } = await getSupabaseBrowserClient()!
        .from('popups')
        .select('id, slug, title, status, needs_review, rejection_reason, ends_at')
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data as OwnPopup[];
    },
  });
  if (query.isPending) return <PopupCardSkeleton variant="row" />;
  if (query.error) return <Alert tone="error">{t('admin.loadFailed')}</Alert>;
  if (!query.data.length) return <p className="t-body">{t('business.empty')}</p>;
  return (
    <ul className={styles.list}>
      {query.data.map((p) => (
        <OwnPopupRow key={p.id} popup={p} />
      ))}
    </ul>
  );
}

function OwnPopupRow({ popup }: { popup: OwnPopup }) {
  const { t } = useI18n();
  const ended = new Date(popup.ends_at) < new Date();
  const status = ended ? 'ended' : popup.status;
  const stats = useQuery({
    queryKey: ['popup-stats', popup.id],
    queryFn: async () => {
      const { data, error } = await getSupabaseBrowserClient()!.rpc('popup_stats', { p_popup_id: popup.id, p_days: 30 });
      if (error) throw new Error(error.message);
      return (data as { views: number; saves: number; navigations: number }[])[0];
    },
  });
  return (
    <li className={styles.row}>
      <div className={styles.rowHead}>
        <h3 className="t-heading">{popup.title}</h3>
        <span className={`${styles.status} ${styles[status]}`}>{t(`business.status.${status}`)}</span>
      </div>
      {popup.status === 'rejected' && popup.rejection_reason ? <p className="t-body">{t('business.rejectedReason', { reason: popup.rejection_reason })}</p> : null}
      {popup.needs_review && popup.status === 'approved' ? <p className="t-meta t-secondary">{t('business.needsReview')}</p> : null}
      <p className="t-meta t-secondary">{t('business.stats')}</p>
      <dl className={styles.stats}>
        {(['views', 'saves', 'navigations'] as const).map((k) => (
          <div key={k}>
            <dt>{t(`business.${k}`)}</dt>
            <dd>{stats.data ? stats.data[k] : '–'}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.rowActions}>
        <ButtonLink href={`/business/edit?id=${popup.id}`} variant="secondary" size="medium" icon="pencil-outline">
          {t('business.edit')}
        </ButtonLink>
        {status === 'approved' ? (
          <ButtonLink
            href={`/promote?popup=${encodeURIComponent(popup.slug)}&title=${encodeURIComponent(popup.title)}`}
            size="medium"
            icon="rocket-launch-outline"
          >
            {t('promote.rowCta')}
          </ButtonLink>
        ) : null}
        <Link href={`/p/${popup.slug}`} className={styles.viewLink}>
          {t('business.view')}
          <Icon name="open-in-new" size={18} />
        </Link>
      </div>
    </li>
  );
}
