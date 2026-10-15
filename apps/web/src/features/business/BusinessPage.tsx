'use client';

import { useSearchParams } from 'next/navigation';
import { BusinessHome } from './BusinessHome';

export function BusinessPage() {
  const notice = useSearchParams().get('notice');
  return <BusinessHome notice={notice === 'submitted' || notice === 'updated' ? notice : null} />;
}
