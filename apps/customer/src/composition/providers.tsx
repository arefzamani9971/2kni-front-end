'use client';
import { MockApiBoundary, SessionGate } from '@dukani/app-core';
import { AppLink, useNextNavigation } from '@dukani/app-core/next';
import { AuthModuleProvider } from '@dukani/auth';
import { DataProvider } from '@dukani/data';
import { ContainerProvider, NavigationProvider, ReleaseProvider, useContainer } from '@dukani/platform';
import { customerRoutes } from '@dukani/routes';
import { LinkProvider, Spinner, ToastProvider } from '@dukani/ui-kit';
import { useState, type ReactNode } from 'react';
import { env } from '../env';
import { createCustomerContainer, type CustomerContainer } from './container';

export const useCustomer = () => useContainer<CustomerContainer>();

function Navigation({ children }: { children: ReactNode }) {
  return <NavigationProvider value={useNextNavigation()}>{children}</NavigationProvider>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [c] = useState(() => createCustomerContainer(env));
  return (
    <MockApiBoundary enabled={env.apiMode === 'mock'} fallback={<BootSpinner />}>
      <ContainerProvider container={c}>
        <ReleaseProvider config={{ current: env.release, flags: env.flags }}>
          <DataProvider>
            <LinkProvider component={AppLink}>
              <Navigation>
                <ToastProvider>
                  <AuthModuleProvider value={c.modules.auth}>{children}</AuthModuleProvider>
                </ToastProvider>
              </Navigation>
            </LinkProvider>
          </DataProvider>
        </ReleaseProvider>
      </ContainerProvider>
    </MockApiBoundary>
  );
}

export function SignedIn({ children }: { children: ReactNode }) {
  const { session } = useCustomer();
  return (
    <SessionGate session={session} loginHref={customerRoutes.login} fallback={<BootSpinner />}>
      {children}
    </SessionGate>
  );
}

export function BootSpinner() {
  return (
    <div className="flex h-dvh items-center justify-center bg-canvas text-fg-brand">
      <Spinner size={32} />
    </div>
  );
}
