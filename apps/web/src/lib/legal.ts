import company from '@whats-poppin/shared/src/legal/company.json';
import accessibilityV1Ar from '@whats-poppin/shared/src/legal/docs/accessibility.v1.ar.json';
import accessibilityV1En from '@whats-poppin/shared/src/legal/docs/accessibility.v1.en.json';
import accessibilityV1He from '@whats-poppin/shared/src/legal/docs/accessibility.v1.he.json';
import accessibilityV2He from '@whats-poppin/shared/src/legal/docs/accessibility.v2.he.json';
import advertisersV1He from '@whats-poppin/shared/src/legal/docs/advertisers.v1.he.json';
import privacyV1Ar from '@whats-poppin/shared/src/legal/docs/privacy.v1.ar.json';
import privacyV1En from '@whats-poppin/shared/src/legal/docs/privacy.v1.en.json';
import privacyV1He from '@whats-poppin/shared/src/legal/docs/privacy.v1.he.json';
import privacyV2He from '@whats-poppin/shared/src/legal/docs/privacy.v2.he.json';
import termsV1Ar from '@whats-poppin/shared/src/legal/docs/terms.v1.ar.json';
import termsV1En from '@whats-poppin/shared/src/legal/docs/terms.v1.en.json';
import termsV1He from '@whats-poppin/shared/src/legal/docs/terms.v1.he.json';
import termsV2He from '@whats-poppin/shared/src/legal/docs/terms.v2.he.json';
import { DEFAULT_LANG, type Lang } from './i18n';

// Legal documents are versioned data files in packages/shared/src/legal/docs/<doc>.v<N>.<lang>.json.
// To publish a new version: add a new file with the next version number (never edit an old one),
// so every version an advertiser approved stays available at /legal/<doc>/<version>.

export const LEGAL_DOCS = ['terms', 'privacy', 'accessibility', 'advertisers'] as const;
export type LegalDocId = (typeof LEGAL_DOCS)[number];

export type LegalItem = string | { text: string; list: string[] };
interface DocBase {
  doc: string;
  version: number;
  updated: string;
  lang: string;
  title: string;
}
export interface StructuredDoc extends DocBase {
  summary: string[];
  sections: { id: string; title: string; items: LegalItem[] }[];
}
/** Version 1 of the first documents: plain paragraphs, "## " marks a heading. */
export interface LegacyDoc extends DocBase {
  legacyBody: string[];
}
export type LegalDocument = StructuredDoc | LegacyDoc;

const REGISTRY: Record<LegalDocId, Record<number, Partial<Record<Lang, LegalDocument>>>> = {
  accessibility: {
    1: { ar: accessibilityV1Ar, en: accessibilityV1En, he: accessibilityV1He },
    2: { he: accessibilityV2He },
  },
  advertisers: {
    1: { he: advertisersV1He },
  },
  privacy: {
    1: { ar: privacyV1Ar, en: privacyV1En, he: privacyV1He },
    2: { he: privacyV2He },
  },
  terms: {
    1: { ar: termsV1Ar, en: termsV1En, he: termsV1He },
    2: { he: termsV2He },
  },
};

export function isLegalDoc(value: string): value is LegalDocId {
  return (LEGAL_DOCS as readonly string[]).includes(value);
}

export function legalVersions(id: LegalDocId): number[] {
  return Object.keys(REGISTRY[id]).map(Number).sort((a, b) => a - b);
}

export function latestLegalVersion(id: LegalDocId): number {
  const all = legalVersions(id);
  return all[all.length - 1];
}

/** The document in the visitor's language, or the Hebrew original (the binding text) until translated. */
export function getLegalDoc(id: LegalDocId, version: number, lang: Lang): { doc: LegalDocument; translated: boolean } | null {
  const byLang = REGISTRY[id]?.[version];
  if (!byLang) return null;
  const doc = byLang[lang] ?? byLang[DEFAULT_LANG];
  return doc ? { doc, translated: doc.lang === lang } : null;
}

export const LEGAL_EMAIL = company.email;

/** Name, business number and address, as far as they're filled in (empty until the owner decides to publish them). */
export function companyLine(): string {
  return [company.ownerName, company.businessId ? `${company.businessType} מס' ${company.businessId}` : '', company.address]
    .filter(Boolean)
    .join(', ');
}

/**
 * Fills {{company}} and {{owner}}. While the operator's details aren't published, the sentence is
 * written without them: "החברה: המפעיל את WHATS POPPIN", "רכז הנגישות: <email>".
 */
export function fillCompany(text: string): string {
  const line = companyLine();
  const out = line ? text.replaceAll('{{company}}', line) : text.replaceAll('{{company}}, ', '').replaceAll('{{company}}', 'מפעיל הפלטפורמה');
  return company.ownerName ? out.replaceAll('{{owner}}', company.ownerName) : out.replace(/\{\{owner\}\}\.\s*(מייל:\s*)?/g, '');
}

/** "2026-10-26" → "26.10.2026" */
export function formatLegalDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${Number(d)}.${Number(m)}.${y}`;
}
