'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { Alert, FormCard, TextField } from '@/components/Form';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

/** Sign in / sign up in one step: email → code (or the link in the email). No passwords. */
export function LoginForm() {
  const router = useRouter();
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
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}` },
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

/** Landing page for the link in the sign-in email. */
export function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const code = params.get('code');
    const next = params.get('next') ?? '/profile';
    if (!supabase || !code) {
      setFailed(true);
      return;
    }
    void supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setFailed(true);
      else router.replace(next.startsWith('/') && !next.startsWith('//') ? next : '/profile');
    });
  }, [params, router]);
  return failed ? <Alert tone="error">{t('auth.callbackFailed')}</Alert> : <Alert tone="info">{t('auth.signingIn')}</Alert>;
}
