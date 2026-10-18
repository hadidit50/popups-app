'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { Alert, FormCard } from '@/components/Form';
import type { I18n } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n-client';
import { disablePush, enablePush, isPushEnabled, pushSupport, type PushSupport } from '@/lib/push';

function supportMessage(t: I18n['t'], s: PushSupport): string | null {
  if (s === 'ios-needs-install') return t('notifications.iosInstall');
  if (s === 'denied') return t('notifications.denied');
  if (s === 'unsupported') return t('notifications.unsupported');
  return null;
}

/** On/off for "remind me before a saved pop-up ends". Asks the browser only after a tap. */
export function NotificationSettings({ compact = false, plain = false }: { compact?: boolean; plain?: boolean }) {
  const { t } = useI18n();
  const [support, setSupport] = useState<PushSupport | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const s = pushSupport();
    setSupport(s);
    if (s === 'available') void isPushEnabled().then(setEnabled);
  }, []);

  if (!support || support === 'unconfigured') return null;
  if (compact && (enabled || support !== 'available')) return null;

  const message = supportMessage(t, support);
  const content = (
    <>
      <p className="t-body">{compact ? t('notifications.savedPromptBody') : t('notifications.body')}</p>
      {message ? (
        <Alert tone="info">{message}</Alert>
      ) : enabled ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <Alert tone="ok">{t('notifications.enabled')}</Alert>
          <Button
            variant="ghost"
            size="medium"
            onClick={async () => {
              setBusy(true);
              await disablePush();
              setEnabled(false);
              setBusy(false);
            }}
            loading={busy}
          >
            {t('notifications.disable')}
          </Button>
        </div>
      ) : (
        <Button
          icon="bell-ring-outline"
          loading={busy}
          onClick={async () => {
            setBusy(true);
            setFailed(false);
            const ok = await enablePush().catch(() => false);
            setEnabled(ok);
            setFailed(!ok);
            setSupport(pushSupport());
            setBusy(false);
          }}
        >
          {t('notifications.enable')}
        </Button>
      )}
      {failed ? <Alert tone="error">{t('notifications.failed')}</Alert> : null}
    </>
  );

  return (
    <FormCard title={compact ? t('notifications.savedPromptTitle') : t('notifications.title')} plain={plain}>
      {content}
    </FormCard>
  );
}
