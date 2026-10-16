import { Suspense } from 'react';
import { Page } from '@/components/Page';
import { AuthCallback } from '@/features/auth/LoginForm';

export default function AuthCallbackPage() {
  return (
    <Page>
      <Suspense>
        <AuthCallback />
      </Suspense>
    </Page>
  );
}
