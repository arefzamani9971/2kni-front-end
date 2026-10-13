'use client';
import { MockApiBoundary } from '@dukani/app-core';
import { AppLink } from '@dukani/app-core/next';
import { AuthModuleProvider } from '@dukani/auth';
import { MembershipsModuleProvider } from '@dukani/memberships';
import { DataProvider } from '@dukani/data';
import { ContainerProvider, ReleaseProvider, useSessionVersion } from '@dukani/platform';
import { LinkProvider, ToastProvider, ViewportProvider } from '@dukani/ui-kit';
import { useState, type ReactNode } from 'react';
import { env } from '../env';
import { BootSpinner } from './boot-spinner';
import { createCustomerContainer } from './container';
import { Navigation } from './navigation';

export function AppProviders({ children }: { children: ReactNode }) {
  const [c] = useState(() => createCustomerContainer(env));
  const sessionVersion = useSessionVersion(c.session);
  return (
    <MockApiBoundary enabled={env.apiMode === 'mock'} fallback={<BootSpinner />}>
      <ContainerProvider container={c}>
        <ReleaseProvider config={{ current: env.release, flags: env.flags }}>
          <DataProvider scopeKey={sessionVersion}>
            <LinkProvider component={AppLink}>
              <Navigation>
                <ViewportProvider>
                  <ToastProvider>
                    <AuthModuleProvider value={c.modules.auth}>
                      <MembershipsModuleProvider value={c.modules.memberships}>
                        {children}
                      </MembershipsModuleProvider>
                    </AuthModuleProvider>
                  </ToastProvider>
                </ViewportProvider>
              </Navigation>
            </LinkProvider>
          </DataProvider>
        </ReleaseProvider>
      </ContainerProvider>
    </MockApiBoundary>
  );
}
