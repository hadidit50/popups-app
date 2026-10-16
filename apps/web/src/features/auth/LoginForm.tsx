'use client';

import { useSearchParams } from 'next/navigation';
import { useLocalRouter } from '@/lib/router';
import { useEffect, useState } from 'react';
import type { EmailOtpType } from '@supabase/supabase-js';
import { Button, ButtonLink } from '@/components/Button';
import { Alert, FormCard, TextField } from '@/components/Form';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n-client';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

/** Sign in / sign up in one step: email → code (or the link in the email). No passwords. */
export function LoginForm() {
  const { t, href } = useI18n();
  const router = useLocalRouter();
  const next = useSearchParams().get('next') || '/profile';
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/profile';
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace(safeNext);
  }, [user, router, safeNext]);

  if (!isSupabaseConfigured) return <Alert tone="info">{t('auth.notConfigured')}</Alert>;

  const send = async () => {
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError(t('auth.invalidEmail'));
      return;
    }
    setBusy(true);
    const supabase = getSupabaseBrowserClient()!;
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(href(safeNext))}` },
    });
    setBusy(false);
    if (err) setError(t('auth.sendFailed'));
    else setStep('code');
  };

  const verify = async () => {
    setError(null);
    setBusy(true);
    const supabase = getSupabaseBrowserClient()!;
    const { error: err } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    setBusy(false);
    if (err) setError(t('auth.invalidCode'));
    else router.replace(safeNext);
  };

  return (
    <FormCard>
      <p className="t-body">{t('auth.why')}</p>
      {step === 'email' ? (
        <form
          style={{ display: 'grid', gap: 'var(--space-md)' }}
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <TextField
            label={t('auth.email')}
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          <Button type="submit" icon="email-outline" loading={busy} fullWidth>
            {t('auth.sendCode')}
          </Button>
        </form>
      ) : (
        <form
          style={{ display: 'grid', gap: 'var(--space-md)' }}
          onSubmit={(e) => {
            e.preventDefault();
            void verify();
          }}
        >
          <Alert tone="ok">{t('auth.codeSent', { email })}</Alert>
          <TextField
            label={t('auth.code')}
            inputMode="numeric"
            autoComplete="one-time-code"
            dir="ltr"
            maxLength={10}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            error={error}
            autoFocus
          />
          <Button type="submit" icon="login" loading={busy} fullWidth disabled={code.length < 6}>
            {t('auth.verify')}
          </Button>
          <p className="t-meta t-secondary">{t('auth.spamHint')}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
            <Button variant="ghost" size="medium" onClick={() => void send()}>
              {t('auth.resend')}
            </Button>
            <Button
              variant="ghost"
              size="medium"
              onClick={() => {
                setStep('email');
                setCode('');
                setError(null);
              }}
            >
              {t('auth.changeEmail')}
            </Button>
          </div>
        </form>
      )}
    </FormCard>
  );
}

/**
 * Landing page for the link in the sign-in email. Two kinds of links:
 * - `token_hash` (our email template): works in any browser, even if the email is opened elsewhere.
 * - `code` (Supabase's default email): only works in the browser where the code was requested.
 */
export function AuthCallback() {
  const { t } = useI18n();
  const router = useLocalRouter();
  const params = useSearchParams();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const nextParam = params.get('next') ?? '/profile';
    const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/profile';
    const tokenHash = params.get('token_hash');
    const code = params.get('code');
    if (!supabase || (!tokenHash && !code)) {
      setFailed(true);
      return;
    }
    let cancelled = false;
    void (async () => {
      const { error } = tokenHash
        ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: (params.get('type') as EmailOtpType | null) ?? 'email' })
        : await supabase.auth.exchangeCodeForSession(code!);
      if (cancelled) return;
      if (!error) return router.replace(next);
      // A link opened twice still counts if the first attempt already signed the visitor in.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session && !data.session.user.is_anonymous) router.replace(next);
      else setFailed(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [params, router]);
  if (!failed) return <Alert tone="info">{t('auth.signingIn')}</Alert>;
  return (
    <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
      <Alert tone="error">{t('auth.callbackFailed')}</Alert>
      <ButtonLink href="/login" icon="email-outline" fullWidth>
        {t('auth.newCode')}
      </ButtonLink>
    </div>
  );
}
