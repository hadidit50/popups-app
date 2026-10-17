'use client';

import { CONTACT_EMAIL } from './contact';

/**
 * Opens a ready-to-send email to us: in Gmail (new tab) or the device's email app. Used by the
 * contact and promotion forms, so there's no server to run and replies go straight to the sender.
 */
export function openEmail(kind: 'gmail' | 'mail', subject: string, body: string) {
  if (!CONTACT_EMAIL) return;
  const q = encodeURIComponent;
  if (kind === 'gmail') {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${q(CONTACT_EMAIL)}&su=${q(subject)}&body=${q(body)}`, '_blank', 'noopener');
  } else {
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${q(subject)}&body=${q(body)}`;
  }
}
