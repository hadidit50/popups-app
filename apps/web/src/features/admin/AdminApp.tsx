'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, ButtonLink } from '@/components/Button';
import { Alert, FormCard, SelectField, TextField } from '@/components/Form';
import { Icon } from '@/components/Icon';
import { PopupCardSkeleton } from '@/components/Skeleton';
import { StateView } from '@/components/StateView';
import { SignedInGate } from '@/features/business/Gate';
import { PopupForm } from '@/features/editor/PopupForm';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { emptyPopupForm, loadCities, loadPopupForm } from '@/lib/popup-editor';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import styles from './Admin.module.css';

const TABS = ['queue', 'popups', 'new', 'promotions', 'stats'] as const;
type Tab = (typeof TABS)[number] | 'edit';

const db = () => getSupabaseBrowserClient()!;

/** The admin panel: one page, five tabs. Built for adding many pop-ups quickly from a laptop. */
export function AdminApp() {
  return (
    <SignedInGate next="/admin" title={t('admin.title')} body={t('admin.notAdminBody')}>
      <AdminGuard />
    </SignedInGate>
  );
}

function AdminGuard() {
  const { isAdmin, loading } = useAuth();
  if (loading) return <PopupCardSkeleton variant="row" />;
  if (!isAdmin) return <StateView icon="shield-account-outline" title={t('admin.notAdminTitle')} body={t('admin.notAdminBody')} />;
  return <AdminTabs />;
}

function AdminTabs() {
  const params = useSearchParams();
  const tab = (params.get('tab') as Tab) || 'queue';
  return (
    <div className={styles.admin}>
      <nav aria-label={t('admin.title')}>
        <ul className={styles.tabs}>
          {TABS.map((key) => (
            <li key={key}>
              <Link href={`/admin?tab=${key}`} className={styles.tab} aria-current={tab === key ? 'page' : undefined}>
                {t(`admin.tabs.${key}`)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {tab === 'queue' ? <Queue /> : null}
      {tab === 'popups' ? <AllPopups /> : null}
      {tab === 'new' ? <AdminEditor /> : null}
      {tab === 'edit' ? <AdminEditor id={params.get('id')} /> : null}
      {tab === 'promotions' ? <Promotions /> : null}
      {tab === 'stats' ? <Stats /> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Approval queue
// ---------------------------------------------------------------------------
interface AdminPopupRow {
  id: string;
  slug: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  needs_review: boolean;
  source: 'manual' | 'organizer';
  starts_at: string;
  ends_at: string;
  address: string;
  organizers: { name: string } | null;
}

const SELECT = 'id, slug, title, status, needs_review, source, starts_at, ends_at, address, organizers(name)';

function Queue() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['admin', 'queue'],
    queryFn: async () => {
      const { data, error } = await db()
        .from('popups')
        .select(SELECT)
        .or('status.eq.pending,needs_review.eq.true')
        .gt('ends_at', new Date().toISOString())
        .order('created_at');
      if (error) throw new Error(error.message);
      return data as unknown as AdminPopupRow[];
    },
  });
  const update = useMutation({
    mutationFn: async (args: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await db().from('popups').update(args.patch).eq('id', args.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  });

  if (query.isPending) return <PopupCardSkeleton variant="row" />;
  if (query.error) return <Alert tone="error">{t('admin.loadFailed')}</Alert>;
  if (!query.data.length) return <StateView icon="check-circle" title={t('admin.queueEmpty')} />;

  return (
    <ul className={styles.list}>
      {query.data.map((p) => (
        <QueueItem
          key={p.id}
          popup={p}
          busy={update.isPending}
          onApprove={() => update.mutate({ id: p.id, patch: { status: 'approved', needs_review: false, rejection_reason: null } })}
          onReject={(reason) => update.mutate({ id: p.id, patch: { status: 'rejected', needs_review: false, rejection_reason: reason || null } })}
          onReviewed={() => update.mutate({ id: p.id, patch: { needs_review: false } })}
        />
      ))}
    </ul>
  );
}

function QueueItem({
  popup,
  busy,
  onApprove,
  onReject,
  onReviewed,
}: {
  popup: AdminPopupRow;
  busy: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onReviewed: () => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const edited = popup.status === 'approved' && popup.needs_review;
  return (
    <li className={styles.item}>
      <div className={styles.itemHead}>
        <h3 className="t-heading">{popup.title}</h3>
        {edited ? <span className={styles.badge}>{t('admin.edited')}</span> : null}
      </div>
      <p className="t-meta t-secondary">
        {popup.organizers?.name ? t('admin.submittedBy', { name: popup.organizers.name }) : t('admin.manual')} · {popup.address}
      </p>
      <div className={styles.actions}>
        <ButtonLink href={`/p/${popup.slug}`} variant="ghost" size="medium" icon="eye-outline">
          {t('business.view')}
        </ButtonLink>
        <ButtonLink href={`/admin?tab=edit&id=${popup.id}`} variant="ghost" size="medium" icon="pencil-outline">
          {t('admin.edit')}
        </ButtonLink>
        {edited ? (
          <Button size="medium" icon="check-bold" onClick={onReviewed} disabled={busy}>
            {t('admin.markReviewed')}
          </Button>
        ) : (
          <>
            <Button size="medium" icon="check-bold" onClick={onApprove} disabled={busy}>
              {t('admin.approve')}
            </Button>
            <Button size="medium" variant="secondary" icon="close" onClick={() => setRejecting((v) => !v)} disabled={busy}>
              {t('admin.reject')}
            </Button>
          </>
        )}
      </div>
      {rejecting ? (
        <form
          className={styles.rejectForm}
          onSubmit={(e) => {
            e.preventDefault();
            onReject(reason);
          }}
        >
          <TextField label={t('admin.rejectPrompt')} optional value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button type="submit" variant="secondary" size="medium" disabled={busy}>
            {t('admin.reject')}
          </Button>
        </form>
      ) : null}
    </li>
  );
}

// ---------------------------------------------------------------------------
// All pop-ups
// ---------------------------------------------------------------------------
function AllPopups() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [showEnded, setShowEnded] = useState(false);
  const query = useQuery({
    queryKey: ['admin', 'popups', q, showEnded],
    queryFn: async () => {
      let req = db().from('popups').select(SELECT).order('created_at', { ascending: false }).limit(200);
      if (q.trim()) req = req.ilike('title', `%${q.trim()}%`);
      if (!showEnded) req = req.gt('ends_at', new Date().toISOString());
      const { data, error } = await req;
      if (error) throw new Error(error.message);
      return data as unknown as AdminPopupRow[];
    },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db().from('popups').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  });

  return (
    <div className={styles.stack}>
      <div className={styles.filters}>
        <TextField label={t('admin.search')} optional type="search" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className={styles.check}>
          <input type="checkbox" checked={showEnded} onChange={(e) => setShowEnded(e.target.checked)} />
          {t('admin.showEnded')}
        </label>
      </div>
      {query.isPending ? (
        <PopupCardSkeleton variant="row" />
      ) : query.error ? (
        <Alert tone="error">{t('admin.loadFailed')}</Alert>
      ) : (
        <ul className={styles.list}>
          {query.data.map((p) => {
            const ended = new Date(p.ends_at) < new Date();
            const status = ended ? 'ended' : p.status;
            return (
              <li key={p.id} className={styles.item}>
                <div className={styles.itemHead}>
                  <h3 className="t-heading">{p.title}</h3>
                  <span className={`${styles.status} ${styles[status]}`}>{t(`business.status.${status}`)}</span>
                </div>
                <p className="t-meta t-secondary">
                  {p.organizers?.name ?? t('admin.manual')} · {p.address}
                </p>
                <div className={styles.actions}>
                  <ButtonLink href={`/admin?tab=edit&id=${p.id}`} variant="secondary" size="medium" icon="pencil-outline">
                    {t('admin.edit')}
                  </ButtonLink>
                  <ButtonLink href={`/p/${p.slug}`} variant="ghost" size="medium" icon="eye-outline">
                    {t('business.view')}
                  </ButtonLink>
                  <Button
                    variant="ghost"
                    size="medium"
                    icon="delete-outline"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm(t('admin.deleteConfirm', { title: p.title }))) remove.mutate(p.id);
                    }}
                  >
                    {t('admin.delete')}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add / edit
// ---------------------------------------------------------------------------
function AdminEditor({ id }: { id?: string | null }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [done, setDone] = useState<string | null>(null);
  const cities = useQuery({ queryKey: ['cities'], queryFn: loadCities, staleTime: Infinity });
  const existing = useQuery({ queryKey: ['popup-form', id], queryFn: () => loadPopupForm(id!), enabled: !!id });
  const [formKey, setFormKey] = useState(0);

  if (cities.isPending || (id && existing.isPending)) return <PopupCardSkeleton />;
  if (cities.error || existing.error) return <Alert tone="error">{t('admin.loadFailed')}</Alert>;
  if (id && !existing.data) return <Alert tone="error">{t('details.notFoundTitle')}</Alert>;

  return (
    <div className={styles.stack}>
      {done ? (
        <Alert tone="ok">
          {t(id ? 'admin.saved' : 'admin.added')}{' '}
          <Link href={`/p/${done}`} className={styles.inlineLink}>
            {t('business.view')}
          </Link>
        </Alert>
      ) : null}
      <PopupForm
        key={`${id ?? 'new'}-${formKey}`}
        initial={existing.data ?? { ...emptyPopupForm(), status: 'approved' }}
        cities={cities.data ?? []}
        mode="admin"
        onSaved={async ({ slug }) => {
          setDone(slug);
          await qc.invalidateQueries({ queryKey: ['admin'] });
          if (id) {
            await qc.invalidateQueries({ queryKey: ['popup-form', id] });
            router.push('/admin?tab=popups');
          } else {
            // Fresh empty form for the next pop-up: adding many in a row is the common case.
            setFormKey((k) => k + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Promotions
// ---------------------------------------------------------------------------
interface PromotionRow {
  id: string;
  placement: 'hot_now' | 'nearby_top' | 'map_highlight';
  starts_at: string;
  ends_at: string;
  budget_amount: number;
  impressions: number;
  clicks: number;
  status: 'draft' | 'active' | 'paused' | 'ended';
  payment_status: string;
  popups: { title: string; slug: string } | null;
}

function Promotions() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['admin', 'promotions'],
    queryFn: async () => {
      const { data, error } = await db()
        .from('promotions')
        .select('id, placement, starts_at, ends_at, budget_amount, impressions, clicks, status, payment_status, popups(title, slug)')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data as unknown as PromotionRow[];
    },
  });
  const setStatus = useMutation({
    mutationFn: async (args: { id: string; status: PromotionRow['status'] }) => {
      const { error } = await db().from('promotions').update({ status: args.status }).eq('id', args.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'promotions'] }),
  });

  return (
    <div className={styles.stack}>
      <NewPromotion onCreated={() => qc.invalidateQueries({ queryKey: ['admin', 'promotions'] })} />
      <p className="t-meta t-secondary">{t('admin.paymentNote')}</p>
      {list.isPending ? (
        <PopupCardSkeleton variant="row" />
      ) : list.error ? (
        <Alert tone="error">{t('admin.loadFailed')}</Alert>
      ) : !list.data.length ? (
        <p className="t-body">{t('admin.promoEmpty')}</p>
      ) : (
        <ul className={styles.list}>
          {list.data.map((p) => {
            const live = p.status === 'active' && new Date(p.ends_at) > new Date();
            const ctr = p.impressions ? `${((p.clicks / p.impressions) * 100).toFixed(1)}%` : '–';
            return (
              <li key={p.id} className={styles.item}>
                <div className={styles.itemHead}>
                  <h3 className="t-heading">{p.popups?.title ?? '—'}</h3>
                  <span className={`${styles.status} ${live ? styles.approved : styles.ended}`}>{t(`admin.promoStatus.${p.status}`)}</span>
                </div>
                <p className="t-meta t-secondary">
                  {t(`admin.placements.${p.placement}`)} · {new Date(p.starts_at).toLocaleDateString('he-IL')}–{new Date(p.ends_at).toLocaleDateString('he-IL')} · ₪
                  {p.budget_amount}
                </p>
                <dl className={styles.miniStats}>
                  <div>
                    <dt>{t('admin.impressions')}</dt>
                    <dd>{p.impressions}</dd>
                  </div>
                  <div>
                    <dt>{t('admin.clicks')}</dt>
                    <dd>{p.clicks}</dd>
                  </div>
                  <div>
                    <dt>{t('admin.ctr')}</dt>
                    <dd>{ctr}</dd>
                  </div>
                </dl>
                <div className={styles.actions}>
                  {p.status === 'active' ? (
                    <Button variant="secondary" size="medium" onClick={() => setStatus.mutate({ id: p.id, status: 'paused' })}>
                      {t('admin.promoPause')}
                    </Button>
                  ) : (
                    <Button size="medium" onClick={() => setStatus.mutate({ id: p.id, status: 'active' })}>
                      {t('admin.promoResume')}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function NewPromotion({ onCreated }: { onCreated: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [popupId, setPopupId] = useState('');
  const [placement, setPlacement] = useState<PromotionRow['placement']>('hot_now');
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10));
  const [budget, setBudget] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const live = useQuery({
    queryKey: ['admin', 'live-popups'],
    queryFn: async () => {
      const { data, error: err } = await db()
        .from('popups')
        .select('id, title')
        .eq('status', 'approved')
        .gt('ends_at', new Date().toISOString())
        .order('title');
      if (err) throw new Error(err.message);
      return data as { id: string; title: string }[];
    },
  });

  const create = async () => {
    setError(null);
    if (!popupId) {
      setError(t('form.required'));
      return;
    }
    if (end < start) {
      setError(t('form.datesInvalid'));
      return;
    }
    setBusy(true);
    const { error: err } = await db()
      .from('promotions')
      .insert({
        popup_id: popupId,
        placement,
        starts_at: new Date(`${start}T00:00:00`).toISOString(),
        ends_at: new Date(`${end}T23:59:59`).toISOString(),
        budget_amount: Number(budget) || 0,
        status: 'active',
      });
    setBusy(false);
    if (err) setError(t('form.saveFailed', { message: err.message }));
    else {
      setPopupId('');
      onCreated();
    }
  };

  return (
    <FormCard title={t('admin.promoNew')}>
      <form
        className={styles.promoForm}
        onSubmit={(e) => {
          e.preventDefault();
          void create();
        }}
      >
        <SelectField label={t('admin.promoPopup')} value={popupId} onChange={(e) => setPopupId(e.target.value)} error={error}>
          <option value="">—</option>
          {(live.data ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </SelectField>
        <SelectField label={t('admin.promoPlacement')} value={placement} onChange={(e) => setPlacement(e.target.value as PromotionRow['placement'])}>
          {(['hot_now', 'nearby_top', 'map_highlight'] as const).map((p) => (
            <option key={p} value={p}>
              {t(`admin.placements.${p}`)}
            </option>
          ))}
        </SelectField>
        <TextField label={t('admin.promoStart')} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <TextField label={t('admin.promoEnd')} type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
        <TextField label={t('admin.promoBudget')} type="number" inputMode="decimal" min={0} dir="ltr" value={budget} onChange={(e) => setBudget(e.target.value)} />
        <Button type="submit" icon="bullhorn-outline" loading={busy}>
          {t('admin.promoCreate')}
        </Button>
      </form>
    </FormCard>
  );
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------
interface AdminStats {
  live: number;
  pending: number;
  organizers: number;
  views_7d: number;
  saves_7d: number;
  navigations_7d: number;
  top: { id: string; slug: string; title: string; views: number }[];
}

function Stats() {
  const query = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data, error } = await db().rpc('admin_stats');
      if (error) throw new Error(error.message);
      return data as AdminStats;
    },
  });
  if (query.isPending) return <PopupCardSkeleton variant="row" />;
  if (query.error || !query.data) return <Alert tone="error">{t('admin.loadFailed')}</Alert>;
  const s = query.data;
  const tiles: [string, number][] = [
    ['admin.statsLive', s.live],
    ['admin.statsPending', s.pending],
    ['admin.statsViews7', s.views_7d],
    ['admin.statsSaves7', s.saves_7d],
    ['admin.statsNav7', s.navigations_7d],
    ['admin.statsOrganizers', s.organizers],
  ];
  return (
    <div className={styles.stack}>
      <dl className={styles.tiles}>
        {tiles.map(([label, value]) => (
          <div key={label} className={styles.tile}>
            <dt>{t(label)}</dt>
            <dd>{value.toLocaleString('he-IL')}</dd>
          </div>
        ))}
      </dl>
      <FormCard title={t('admin.topPopups')}>
        <ol className={styles.top}>
          {s.top.map((p) => (
            <li key={p.id}>
              <Link href={`/p/${p.slug}`}>{p.title}</Link>
              <span>
                <Icon name="eye-outline" size={18} /> {p.views}
              </span>
            </li>
          ))}
        </ol>
      </FormCard>
    </div>
  );
}
