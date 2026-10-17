/** Where visitors write to us (Vercel env NEXT_PUBLIC_CONTACT_EMAIL). Shown on /contact and the legal pages. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;
