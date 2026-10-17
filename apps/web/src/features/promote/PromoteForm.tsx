'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button, ButtonLink } from '@/components/Button';
import { FilterChip } from '@/components/Chip';
import { Alert, FormCard, Segmented, TextArea, TextField } from '@/components/Form';
import { openEmail } from '@/lib/compose';
import { CONTACT_EMAIL } from '@/lib/contact';
import { useI18n } from '@/lib/i18n-client';

// Each placement's title starts with its own emoji, so no extra icon is needed.
const PLACEMENTS = [{ key: 'hot_now' }, { key: 'nearby_top' }, { key: 'map_highlight' }] as const;
const DURATIONS = ['3d', '1w', '2w', '1m'] as const;
type Duration = (typeof DURATIONS)[number];

/** What a promotion gets you: the three placements, in plain words. */
export function PromoteOptions() {
  const { t } = useI18n();
  return (
    <ul style={{ listStyle: 'none', display: 'grid', gap: 'var(--space-sm)' }}>
      {PLACEMENTS.map((p) => (
        <li key={p.key} style={{ display: 'grid', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)' }}>
          <span style={{ display: 'grid', gap: 2 }}>
            <strong className="t-body-strong">{t(`promote.placements.${p.key}.title`)}</strong>
            <span className="t-body t-secondary">{t(`promote.placements.${p.key}.body`)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Promotion request. Opens a ready email to us (Gmail or the mail app); we reply with a price and a
 * payment link, and mark the promotion paid in the admin panel. Automatic card payments come later.
 */
export function PromoteForm() {
  const { t, href } = useI18n();
  const params = useSearchParams();
  const prefill = params.get('popup');
  const [popup, setPopup] = useState(() =>
    prefill ? `${params.get('title') ?? ''} ${typeof window === 'undefined' ? '' : window.location.origin + href(`/p/${prefill}`)}`.trim() : '',
  );
  const [placements, setPlacements] = useState<string[]>(['hot_now']);
  const [duration, setDuration] = useState<Duration>('1w');
  const [business, setBusiness] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!CONTACT_EMAIL) return <Alert tone="info">{t('contact.notConfigured')}</Alert>;

  const send = (kind: 'gmail' | 'mail') => {
    if (!popup.trim() || !business.trim()) {
      setError(t('promote.missing'));
      return;
    }
    setError(null);
    const lines = [
      `${t('promote.popup')}: ${popup.trim()}`,
      `${t('promote.where')}: ${placements.map((p) => t(`promote.placements.${p}.title`)).join(', ') || '—'}`,
      `${t('promote.howLong')}: ${t(`promote.durations.${duration}`)}`,
      `${t('promote.business')}: ${business.trim()}`,
      phone.trim() ? `${t('promote.phone')}: ${phone.trim()}` : '',
      notes.trim() ? `\n${notes.trim()}` : '',
    ].filter(Boolean);
    openEmail(kind, t('promote.subject', { business: business.trim() }), lines.join('\n'));
  };

  return (
    <FormCard title={t('promote.formTitle')}>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <TextField label={t('promote.popup')} hint={t('promote.popupHint')} value={popup} onChange={(e) => setPopup(e.target.value)} />
      <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-xs)' }}>
        <legend className="t-body-strong" style={{ marginBottom: 'var(--space-xs)' }}>
          {t('promote.where')}
        </legend>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
          {PLACEMENTS.map((p) => (
            <FilterChip
              key={p.key}
              label={t(`promote.placements.${p.key}.title`)}
              selected={placements.includes(p.key)}
              onToggle={() => setPlacements((cur) => (cur.includes(p.key) ? cur.filter((x) => x !== p.key) : [...cur, p.key]))}
            />
          ))}
        </div>
      </fieldset>
      <Segmented
        legend={t('promote.howLong')}
        value={duration}
        options={DURATIONS.map((value) => ({ value, label: t(`promote.durations.${value}`) }))}
        onChange={setDuration}
      />
      <TextField label={t('promote.business')} value={business} autoComplete="organization" onChange={(e) => setBusiness(e.target.value)} />
      <TextField label={t('promote.phone')} optional type="tel" inputMode="tel" dir="ltr" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <TextArea label={t('promote.notes')} optional rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      <p className="t-body-strong">⏱️ {t('promote.promise')}</p>
      <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
        <Button icon="gmail" fullWidth onClick={() => send('gmail')}>
          {t('contact.sendGmail')}
        </Button>
        <Button variant="secondary" icon="email-outline" fullWidth onClick={() => send('mail')}>
          {t('contact.sendMail')}
        </Button>
      </div>
    </FormCard>
  );
}

/** The eye-catching "Promote your pop-up" card on the profile page. */
export function PromoteCard() {
  const { t } = useI18n();
  return (
    <section
      aria-labelledby="promote-card"
      style={{ display: 'grid', gap: 'var(--space-sm)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-xl)', background: 'var(--color-primary-soft)' }}
    >
      <h2 id="promote-card" className="t-title">
        🚀 {t('promote.cardTitle')}
      </h2>
      <p className="t-body">{t('promote.cardBody')}</p>
      <ButtonLink href="/promote" icon="rocket-launch-outline" fullWidth>
        {t('promote.cardCta')}
      </ButtonLink>
    </section>
  );
}
