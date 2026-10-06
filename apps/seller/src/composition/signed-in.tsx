'use client';
import { SessionGate } from '@dukani/app-core';
import { Button, PageState, Screen } from '@dukani/ui-kit';
import { sellerRoutes } from '@dukani/routes';
import type { ReactNode } from 'react';
import { BootSpinner } from './boot-spinner';
import { useSeller } from './use-seller';

/** Signed-in area without a store (stores list, create store). */
export function SignedIn({ children }: { children: ReactNode }) {
  const { session } = useSeller();
  return (
    <SessionGate
      session={session}
      loginHref={sellerRoutes.login}
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
