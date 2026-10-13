'use client';
import { Button, PageShell, PageState, useAppErrorMessage } from '@dukani/ui-kit';
import { useStoreJoin } from '../hooks/use-store-join';
import { useMembershipTranslations } from '../i18n/use-membership-translations';
import type { StoreJoinScreenProps } from './StoreJoinScreen.types';

export function StoreJoinScreen({
  publicCode,
  signedIn,
  sessionReady,
  onLogin,
  onBack,
}: StoreJoinScreenProps) {
  const t = useMembershipTranslations();
  const errorMessage = useAppErrorMessage();
  const flow = useStoreJoin(publicCode, signedIn);
  const store = flow.introduction.data;
  const member = flow.status.data?.isMember === true;
  const busy = flow.join.isPending || flow.marketing.isPending;
  const join = async (marketing: boolean) => {
    try {
      const membership = await flow.join.mutateAsync(undefined);
      if (marketing) await flow.marketing.mutateAsync(membership.storeId);
    } catch {
      /* The corresponding command displays its own error without hiding membership success. */
    }
  };
  return (
    <PageShell
      title={t('title')}
      subtitle={store?.displayName}
      mobileNav={false}
      actions={
        <>
          {store?.available && sessionReady && !signedIn ? (
            <Button onClick={onLogin}>{t('login')}</Button>
          ) : null}
          {store?.available && signedIn && flow.status.isSuccess && !member ? (
            <>
              <Button disabled={busy} loading={flow.join.isPending} onClick={() => void join(false)}>
                {t('join')}
              </Button>
              <Button variant="secondary" disabled={busy} onClick={() => void join(true)}>
                {t('joinMarketing')}
              </Button>
            </>
          ) : null}
          <Button variant="secondary" onClick={onBack} disabled={busy}>
            {t('back')}
          </Button>
        </>
      }
    >
      {flow.introduction.error ? (
        <PageState
          kind="error"
          description={errorMessage(flow.introduction.error)}
          action={<Button onClick={() => void flow.introduction.refetch()}>{t('retry')}</Button>}
        />
      ) : !store || !sessionReady ? (
        <PageState kind="loading" />
      ) : (
        <>
          <section className="bg-surface border-line flex flex-col gap-3 rounded-md border p-4">
            <h2 className="text-heading-m">{store.displayName}</h2>
            {store.address ? <p className="text-body-s text-fg-secondary">{store.address}</p> : null}
            <p className="text-body-m">{t('introduction')}</p>
          </section>
          {!store.available ? (
            <PageState kind="not-released" description={t('unavailable')} />
          ) : signedIn ? (
            <>
              {flow.status.isPending ? (
                <PageState kind="loading" />
              ) : flow.status.error ? (
                <PageState
                  kind="error"
                  description={errorMessage(flow.status.error)}
                  action={<Button onClick={() => void flow.status.refetch()}>{t('retry')}</Button>}
                />
              ) : member ? (
                <p role="status" className="bg-surface rounded-md p-4">
                  {t('joined')}
                </p>
              ) : (
                <p className="text-body-m">{t('consent')}</p>
              )}
              {flow.join.error && !member ? <p role="alert">{errorMessage(flow.join.error)}</p> : null}
              {flow.marketing.error && flow.status.data ? (
                <PageState
                  kind="error"
                  description={t('marketingFailed')}
                  action={
                    <Button disabled={busy} onClick={() => flow.marketing.mutate(flow.status.data!.storeId)}>
                      {t('retryMarketing')}
                    </Button>
                  }
                />
              ) : null}
            </>
          ) : null}
        </>
      )}
    </PageShell>
  );
}
