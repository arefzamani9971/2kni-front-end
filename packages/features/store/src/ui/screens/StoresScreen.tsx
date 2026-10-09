'use client';
import { useStoreTranslations } from '../i18n/use-store-translations';

import { formatJalali } from '@dukani/domain';
import { Button, ContentColumns, FlowShell, PageState, ProductDataRow } from '@dukani/ui-kit';
import { useStorePresentation } from '../i18n/use-store-presentation';
import { useMyStores } from '../hooks/use-my-stores';
import type { StoresScreenProps } from './StoresScreen.types';

/**
 * storeselect «فروشگاه‌های من» (Figma 358:480; desktop 358:5343 «Content columns» with the «Summary» card).
 * Rows are Figma «Dukani/Product Data Row» (title, subtitle, warning-toned action line). The four collections
 * of `GET /stores` keep their own meaning (F02 §4, AC05): only active memberships enter the panel; a pending
 * invitation or ownership transfer is not a membership; a deactivated store has no normal entry. Rows are keyed
 * by id — two stores with the same name are fine.
 */
export function StoresScreen({
  storeHref,
  onCreate,
  onBack,
  onInvitation,
  onOwnershipTransfer,
  onReactivate,
}: StoresScreenProps) {
  const t = useStoreTranslations();
  const presentation = useStorePresentation();
  const until = (iso: string) => presentation.digits(formatJalali(new Date(iso)));

  const my = useMyStores();
  const data = my.data;
  const empty =
    data &&
    !data.stores.length &&
    !data.invitations.length &&
    !data.ownershipTransfers.length &&
    !data.deactivatedStores.length;
  const defaultStore = data?.stores.find((s) => s.isDefault) ?? data?.stores[0];

  return (
    <FlowShell
      appBar={{ title: t('myStores'), back: onBack }}
      actions={
        <Button block onClick={onCreate}>
          {t('registerStore')}
        </Button>
      }
    >
      {my.isPending ? <PageState kind="loading" rows={2} /> : null}
      {my.error ? (
        <PageState
          kind="error"
          description={my.error.message}
          action={
            <Button variant="secondary" onClick={() => void my.refetch()}>
              {t('retry')}
            </Button>
          }
        />
      ) : null}
      {empty ? <PageState kind="empty" title={t('noStores')} description={t('noStoresHint')} /> : null}
      {data && !empty ? (
        <ContentColumns
          summary={
            <>
              <h2 className="text-heading-m text-fg-primary">{t('myStores')}</h2>
              {defaultStore ? <p>{defaultStore.name}</p> : null}
              <Button onClick={onCreate} className="self-start">
                {t('registerStore')}
              </Button>
            </>
          }
        >
          <ul className="flex flex-col gap-3">
            {data.stores.map((s) => (
              <li key={s.id}>
                <ProductDataRow
                  href={storeHref(s.id)}
                  title={s.name}
                  subtitle={`${t(`roles.${s.role}`)} · ${s.isDefault ? t('defaultStore') : s.typeName}`}
                  meta={t('enterWorkspace')}
                  metaTone="warning"
                />
              </li>
            ))}
            {data.invitations.map((i) => (
              <li key={i.id}>
                <ProductDataRow
                  onClick={onInvitation ? () => onInvitation(i) : undefined}
                  title={i.storeName}
                  subtitle={
                    i.invitedBy
                      ? t('invitationBy', { name: i.invitedBy, date: until(i.expiresAt) })
                      : t('invitation', { date: until(i.expiresAt) })
                  }
                  meta={onInvitation ? t('viewInvitation') : undefined}
                  metaTone="warning"
                />
              </li>
            ))}
            {data.ownershipTransfers.map((transfer) => (
              <li key={transfer.id}>
                <ProductDataRow
                  onClick={onOwnershipTransfer ? () => onOwnershipTransfer(transfer) : undefined}
                  title={transfer.storeName}
                  subtitle={t('transfer', { date: until(transfer.expiresAt) })}
                  meta={onOwnershipTransfer ? t('reviewTransfer') : undefined}
                  metaTone="warning"
                />
              </li>
            ))}
            {data.deactivatedStores.map((d) => (
              <li key={d.storeId}>
                <ProductDataRow
                  onClick={onReactivate && d.canReactivate ? () => onReactivate(d) : undefined}
                  title={d.storeName}
                  subtitle={d.canReactivate ? t('inactiveStore') : t('inactiveSupport')}
                  meta={onReactivate && d.canReactivate ? t('reactivate') : undefined}
                  metaTone="warning"
                />
              </li>
            ))}
          </ul>
        </ContentColumns>
      ) : null}
    </FlowShell>
  );
}
