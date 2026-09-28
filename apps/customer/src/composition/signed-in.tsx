'use client';
import { SessionGate } from '@dukani/app-core';
import { customerRoutes } from '@dukani/routes';
import type { ReactNode } from 'react';
import { BootSpinner } from './boot-spinner';
import { useCustomer } from './use-customer';

export function SignedIn({ children }: { children: ReactNode }) {
  const { session } = useCustomer();
  return (
    <SessionGate session={session} loginHref={customerRoutes.login} fallback={<BootSpinner />}>
      {children}
    </SessionGate>
  );
}
