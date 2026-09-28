'use client';
import { SessionGate } from '@dukani/app-core';
import { sellerRoutes } from '@dukani/routes';
import type { ReactNode } from 'react';
import { BootSpinner } from './boot-spinner';
import { useSeller } from './use-seller';

/** Signed-in area without a store (stores list, create store). */
export function SignedIn({ children }: { children: ReactNode }) {
  const { session } = useSeller();
  return (
    <SessionGate session={session} loginHref={sellerRoutes.login} fallback={<BootSpinner />}>
      {children}
    </SessionGate>
  );
}
