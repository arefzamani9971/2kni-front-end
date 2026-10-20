'use client';
import { useActiveStore, useNavigation, useOnlineStatus } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import {
  Alert,
  Button,
  ConfirmDialog,
  PageState,
  TwoColumnWorkspace,
  useAppErrorMessage,
  useConfirmAction,
} from '@dukani/ui-kit';
import { useCallback, useRef } from 'react';
import { currentItem, isQueueDone, openingProgress } from '../../domain/opening-queue';
import { emptyReceiptForm } from '../../domain/receipt-form';
import { OpeningQueuePanel } from '../components/OpeningQueuePanel';
import { OpeningResult } from '../components/OpeningResult';
import { PurchasingShell } from '../common/components/PurchasingShell';
import { ReceiptForm } from '../quick-receipt/components/ReceiptForm';
import type { ReceiptFormHandle } from '../quick-receipt/types/ReceiptForm.types';
import { ReceiptOutcome } from '../quick-receipt/components/ReceiptOutcome';
import { SalePriceOutcome } from '../quick-receipt/components/SalePriceOutcome';
import { SelectedProductRow } from '../quick-receipt/components/SelectedProductRow';
import { useOpeningQueue } from '../hooks/use-opening-queue';
import { useStoreProduct } from '../common/hooks/use-store-product';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';
import { OPENING_FORM_ID } from './OpeningQueueScreen.constants';

/**
 * Grouped opening stock — entry and result (CPB-04 / US-F13-01, Figma 1255:62–65 · 1255:142–145): «موجودی اولیه
 * ۱ از N» with «ثبت موجودی و بعدی», «رد کردن این کالا» and «پایان»; the summary once nothing is left or the queue
 * ended. Each item is its own Opening; the queue survives refresh as a local draft.
 */
export function OpeningQueueScreen({ queueId }: { queueId: string }) {
  const t = usePurchaseTranslations();
  const errorMessage = useAppErrorMessage();
  const store = useActiveStore();
  const nav = useNavigation();
  const online = useOnlineStatus();
  const flow = useOpeningQueue(queueId);
  const { queue, command } = flow;
  const item = queue ? currentItem(queue) : null;
  const product = useStoreProduct(item?.productId ?? null);
  const handle = useRef<ReceiptFormHandle | null>(null);
  const onReady = useCallback((h: ReceiptFormHandle) => (handle.current = h), []);
  const end = useConfirmAction(() => flow.end());
  const toPick = () => nav.push(sellerRoutes.purchases.opening(store.id));
  if (flow.loading)
    return (
      <PurchasingShell title={t('opening.pickTitle')}>
        <PageState kind="loading" rows={4} />
      </PurchasingShell>
    );
  if (!queue)
    return (
      <PurchasingShell
        title={t('opening.pickTitle')}
        back={toPick}
        actions={
          <Button block onClick={toPick}>
            {t('opening.backToPick')}
          </Button>
        }
      >
        <PageState
          kind={flow.error ? 'error' : 'empty'}
          title={t('opening.missingQueue')}
          description={flow.error ? errorMessage(flow.error) : undefined}
        />
      </PurchasingShell>
    );
  const progress = openingProgress(queue);
  const outcomes = (
    <>
      {flow.blocked ? (
        <Alert
          tone="warning"
          title={t('opening.blockedTitle')}
          description={t('opening.blockedHint', { title: flow.blocked })}
        />
      ) : null}
      <SalePriceOutcome state={flow.price.state} onRetry={() => void flow.price.retry()} />
      <ReceiptOutcome
        unknown={command.unknown}
        failed={command.failed?.code === 'OPENING_NOT_ALLOWED' ? null : command.failed}
        draftError={command.draftError}
        followUpFailed={command.completionErrors.length > 0}
        busy={command.busy}
        onRecover={() => void command.recover()}
      />
    </>
  );
  if (isQueueDone(queue) || !item)
    return (
      <PurchasingShell
        title={t('opening.resultTitle')}
        back={() => nav.push(sellerRoutes.products.list(store.id))}
        actions={
          <Button block onClick={() => nav.push(sellerRoutes.products.list(store.id))}>
            {t('opening.backToProducts')}
          </Button>
        }
      >
        {outcomes}
        <OpeningResult queue={queue} />
      </PurchasingShell>
    );
  const locked = !!queue.pending || command.busy;
  const index = queue.items.findIndex((i) => i.productId === item.productId) + 1;
  return (
    <PurchasingShell
      title={t('opening.entryTitle', { index, total: queue.items.length })}
      back={async () => {
        await handle.current?.flush();
        toPick();
      }}
      actions={
        <>
          <Button
            type="submit"
            form={OPENING_FORM_ID}
            block
            loading={command.busy}
            disabled={!product.data || locked || !online}
          >
            {t('opening.recordNext')}
          </Button>
          <Button variant="secondary" block disabled={locked} onClick={() => end.open()}>
            {t('opening.end')}
          </Button>
        </>
      }
    >
      {!online ? <Alert tone="warning" title={t('receipt.offline')} /> : null}
      {outcomes}
      <TwoColumnWorkspace
        primary={
          <>
            <SelectedProductRow product={product.data ?? undefined} title={item.title} />
            {product.data ? (
              <ReceiptForm
                key={item.productId}
                id={OPENING_FORM_ID}
                kind="Opening"
                product={product.data}
                initial={queue.form?.productId === item.productId ? queue.form.values : emptyReceiptForm('')}
                disabled={locked}
                failed={command.failed}
                onReady={onReady}
                onSave={(values) => flow.saveForm(item.productId, values)}
                onSubmit={(values) => flow.submit(item.productId, item.title, values)}
              />
            ) : product.error ? (
              <PageState kind="error" description={errorMessage(product.error)} />
            ) : (
              <PageState kind="loading" rows={3} />
            )}
            <Button variant="secondary" disabled={locked} onClick={() => void flow.skip(item.productId)}>
              {t('opening.skip')}
            </Button>
          </>
        }
        secondary={<OpeningQueuePanel queue={queue} />}
      />
      <ConfirmDialog
        {...end.dialog}
        title={t('opening.endTitle')}
        description={t('opening.endHint', { count: progress.remaining })}
        confirmLabel={t('opening.endConfirm')}
      />
    </PurchasingShell>
  );
}
