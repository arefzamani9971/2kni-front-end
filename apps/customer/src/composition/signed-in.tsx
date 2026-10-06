'use client';
import { SessionGate } from '@dukani/app-core';
import { Button, PageState, Screen } from '@dukani/ui-kit';
import { customerRoutes } from '@dukani/routes';
import type { ReactNode } from 'react';
import { BootSpinner } from './boot-spinner';
import { useCustomer } from './use-customer';

export function SignedIn({ children }: { children: ReactNode }) {
  const { session } = useCustomer();
  return (
    <SessionGate
      session={session}
      loginHref={customerRoutes.login}
      fallback={<BootSpinner />}
      restoreError={(retry) => (
        <Screen>
          <PageState
            kind="error"
            description="بررسی نشست انجام نشد؛ اتصال اینترنت را بررسی کنید و دوباره تلاش کنید."
            action={<Button onClick={retry}>تلاش دوباره</Button>}
          />
        </Screen>
      )}
    >
      {children}
    </SessionGate>
  );
}
