'use client';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { useStoreTranslations } from '../i18n/use-store-translations';

import { ActiveStoreProvider } from '@dukani/platform';
import { Button, PageState, Screen } from '@dukani/ui-kit';
import type { ReactNode } from 'react';
import { useStore } from '../hooks/use-store';

/**
 * `/s/[storeId]` layout gate: loads the store with the member's role and permissions and provides
 * it as the active store. 403 STORE_ACCESS_DENIED / 404 → a page state with a way back.
 */
export function StoreGate({
  storeId,
  onLeave,
  children,
}: {
  storeId: string;
  onLeave: () => void;
  children: ReactNode;
}) {
  const t = useStoreTranslations();
  const errorMessage = useAppErrorMessage();

  const store = useStore(storeId);
  if (store.data)
    return (
      <ActiveStoreProvider
        key={storeId}
        value={{
          id: store.data.id,
          name: store.data.name,
          storeTypeKey: store.data.storeTypeKey,
          role: store.data.role,
          permissions: store.data.permissions,
        }}
      >
        {children}
      </ActiveStoreProvider>
    );
  const e = store.error;
  return (
    <Screen>
      {!e ? (
        <PageState kind="loading" rows={4} />
      ) : (
        <PageState
          kind={e.kind === 'Permission' ? 'permission' : e.kind === 'NotFound' ? 'not-found' : 'error'}
          description={errorMessage(e)}
          action={
            <>
              {e.kind === 'Server' || e.kind === 'Unknown' || e.kind === 'Offline' ? (
                <Button onClick={() => void store.refetch()}>{t('retry')}</Button>
              ) : null}
              <Button variant="secondary" onClick={onLeave}>
                {t('myStores')}
              </Button>
            </>
          }
        />
      )}
    </Screen>
  );
}
