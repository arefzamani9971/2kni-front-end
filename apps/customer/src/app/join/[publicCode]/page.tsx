'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { restoreOnce } from '@dukani/app-core';
import { StoreJoinScreen } from '@dukani/memberships';
import { useNavigation, useSessionState } from '@dukani/platform';
import { customerRoutes } from '@dukani/routes';
import { Button, PageState, ShellNavProvider } from '@dukani/ui-kit';
import { useCustomer } from '../../../composition/use-customer';
import { useAppTranslations } from '../../../i18n/use-app-translations';

export default function StoreJoinPage() {
  const { publicCode } = useParams<{ publicCode: string }>();
  const { session } = useCustomer();
  const state = useSessionState(session);
  const nav = useNavigation();
  const t = useAppTranslations();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void restoreOnce(session).catch(() => {
      if (active) setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [session, attempt]);
  if (failed)
    return (
      <PageState
        kind="error"
        description={t('sessionError')}
        action={
          <Button
            onClick={() => {
              setFailed(false);
              setAttempt(attempt + 1);
            }}
          >
            {t('retry')}
          </Button>
        }
      />
    );
  return (
    <ShellNavProvider
      items={
        state.status === 'signed-in'
          ? [{ id: 'account', label: t('customerAccount'), icon: 'home', href: customerRoutes.home() }]
          : []
      }
      workspace={t('customerAccount')}
      sidebarFooter={t('workspace')}
    >
      <StoreJoinScreen
        key={publicCode}
        publicCode={publicCode}
        signedIn={state.status === 'signed-in'}
        sessionReady={state.status !== 'unknown'}
        onBack={() => nav.push(customerRoutes.home())}
        onLogin={() => nav.push(customerRoutes.login(customerRoutes.join(publicCode)))}
      />
    </ShellNavProvider>
  );
}
