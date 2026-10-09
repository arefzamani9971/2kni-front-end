'use client';
import { useAppTranslations } from '../i18n/use-app-translations';
import { SessionGate } from '@dukani/app-core';
import { Button, PageState, Screen } from '@dukani/ui-kit';
import { sellerRoutes } from '@dukani/routes';
import type { ReactNode } from 'react';
import { BootSpinner } from './boot-spinner';
import { useSeller } from './use-seller';

/** Signed-in area without a store (stores list, create store). */
export function SignedIn({ children }: { children: ReactNode }) {
  const t = useAppTranslations();
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
            description={t('sessionError')}
            action={<Button onClick={retry}>{t('retry')}</Button>}
          />
        </Screen>
      )}
    >
      {children}
    </SessionGate>
  );
}
