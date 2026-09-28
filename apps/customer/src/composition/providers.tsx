'use client';
import { MockApiBoundary } from '@dukani/app-core';
import { AppLink, useNextNavigation } from '@dukani/app-core/next';
import { AuthModuleProvider } from '@dukani/auth';
import { DataProvider } from '@dukani/data';
import { ContainerProvider, NavigationProvider, ReleaseProvider } from '@dukani/platform';
import { LinkProvider, ToastProvider } from '@dukani/ui-kit';
import { useState, type ReactNode } from 'react';
import { env } from '../env';
import { BootSpinner } from './boot-spinner';
import { createCustomerContainer } from './container';

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
