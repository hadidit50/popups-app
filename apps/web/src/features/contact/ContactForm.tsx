'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Alert, FormCard, Segmented, TextArea } from '@/components/Form';
import { openEmail } from '@/lib/compose';
import { CONTACT_EMAIL } from '@/lib/contact';
import { useI18n } from '@/lib/i18n-client';

const TOPICS = ['bug', 'help', 'business', 'idea', 'other'] as const;
type Topic = (typeof TOPICS)[number];

/**
 * No server needed: the visitor writes here, and we open Gmail (or their email app) with
 * everything filled in. They press "Send" there, so the reply comes straight back to them.
 */
export function ContactForm() {
  const { t, lang } = useI18n();
  const [topic, setTopic] = useState<Topic>('bug');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!CONTACT_EMAIL) return <Alert tone="info">{t('contact.notConfigured')}</Alert>;
  const to = CONTACT_EMAIL;

  const compose = () => {
    const from = document.referrer.startsWith(window.location.origin) ? document.referrer : window.location.href;
    const subject = t('contact.subject', { topic: t(`contact.topics.${topic}`) });
    const body = `${message.trim()}\n\n---\n${t('contact.details')}\n${from}\n${lang} · ${navigator.userAgent}`;
    return { subject, body };
  };

  const open = (kind: 'gmail' | 'mail') => {
    if (!message.trim()) {
      setError(t('contact.emptyMessage'));
      return;
    }
    setError(null);
    const { subject, body } = compose();
    openEmail(kind, subject, body);
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
      <FormCard>
        <Segmented
          legend={t('contact.topicLabel')}
          value={topic}
          options={TOPICS.map((value) => ({ value, label: t(`contact.topics.${value}`) }))}
          onChange={setTopic}
        />
        <TextArea
          label={t('contact.message')}
          hint={t('contact.messageHint')}
          rows={6}
          value={message}
          error={error}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
          <Button icon="gmail" fullWidth onClick={() => open('gmail')}>
            {t('contact.sendGmail')}
          </Button>
          <Button variant="secondary" icon="email-outline" fullWidth onClick={() => open('mail')}>
            {t('contact.sendMail')}
          </Button>
        </div>
      </FormCard>

      <section style={{ display: 'grid', gap: 'var(--space-xs)', justifyItems: 'start' }}>
        <p className="t-body">{t('contact.orWrite')}</p>
        <a href={`mailto:${to}`} dir="ltr" className="t-body-strong" style={{ color: 'var(--color-primary)', minHeight: 'var(--touch)', display: 'inline-flex', alignItems: 'center' }}>
          {to}
        </a>
        <Button
          variant="ghost"
          size="medium"
          icon={copied ? 'check' : 'content-copy'}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(to);
              setCopied(true);
            } catch {}
          }}
        >
          {copied ? t('contact.copied') : t('contact.copy')}
        </Button>
      </section>
    </div>
  );
}
