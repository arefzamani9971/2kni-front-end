'use client';
import { MockApiBoundary } from '@dukani/app-core';
import { AppLink, useNextNavigation } from '@dukani/app-core/next';
import { AuthModuleProvider } from '@dukani/auth';
import { DataProvider } from '@dukani/data';
import { ContainerProvider, NavigationProvider, ReleaseProvider } from '@dukani/platform';
import { ProductEntryModuleProvider } from '@dukani/product-entry';
import { ProductsModuleProvider } from '@dukani/products';
import { PurchasingModuleProvider } from '@dukani/purchasing';
import { ReportsModuleProvider } from '@dukani/reports';
import { StoreModuleProvider } from '@dukani/store';
import { LinkProvider, ToastProvider } from '@dukani/ui-kit';
import { useState, type ReactNode } from 'react';
import { env } from '../env';
import { BootSpinner } from './boot-spinner';
import { createSellerContainer } from './container';

function Navigation({ children }: { children: ReactNode }) {
  return <NavigationProvider value={useNextNavigation()}>{children}</NavigationProvider>;
}

/** All app-wide providers in one place; features only see their own module and shared ports. */
export function AppProviders({ children }: { children: ReactNode }) {
  const [c] = useState(() => createSellerContainer(env));
  return (
    <MockApiBoundary enabled={env.apiMode === 'mock'} fallback={<BootSpinner />}>
      <ContainerProvider container={c}>
        <ReleaseProvider config={{ current: env.release, flags: env.flags }}>
          <DataProvider>
            <LinkProvider component={AppLink}>
              <Navigation>
                <ToastProvider>
                  <AuthModuleProvider value={c.modules.auth}>
                    <StoreModuleProvider value={c.modules.store}>
                      <ReportsModuleProvider value={c.modules.reports}>
                        <ProductEntryModuleProvider value={c.modules.productEntry}>
                          <ProductsModuleProvider value={c.modules.products}>
                            <PurchasingModuleProvider value={c.modules.purchasing}>{children}</PurchasingModuleProvider>
                          </ProductsModuleProvider>
                        </ProductEntryModuleProvider>
                      </ReportsModuleProvider>
                    </StoreModuleProvider>
                  </AuthModuleProvider>
                </ToastProvider>
              </Navigation>
            </LinkProvider>
          </DataProvider>
        </ReleaseProvider>
      </ContainerProvider>
    </MockApiBoundary>
  );
}
