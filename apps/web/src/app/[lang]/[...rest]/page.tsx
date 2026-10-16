import { notFound } from 'next/navigation';

/** Any unknown address shows the friendly "page not found" screen, in the visitor's language. */
export default function UnknownPage() {
  notFound();
}
