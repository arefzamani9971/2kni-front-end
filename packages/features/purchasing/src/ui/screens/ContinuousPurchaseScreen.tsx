'use client';
import { useActiveStore, useNavigation, useOnlineStatus } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import type { AppError } from '@dukani/domain';
import {
  Alert,
  Button,
  ConfirmDialog,
  PageState,
  useAppErrorMessage,
  useConfirmAction,
} from '@dukani/ui-kit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ReceiptForm } from '../quick-receipt/components/ReceiptForm';
import type { ReceiptFormHandle } from '../quick-receipt/types/ReceiptForm.types';
import { DuplicateInvoiceDialog } from '../components/DuplicateInvoiceDialog';
import { ProductIdentification } from '../components/ProductIdentification';
import { PurchasingShell } from '../common/components/PurchasingShell';
import { ReceiptOutcome } from '../quick-receipt/components/ReceiptOutcome';
import { RecordedReceiptBanner } from '../components/RecordedReceiptBanner';
import { SalePriceOutcome } from '../quick-receipt/components/SalePriceOutcome';
import { SelectedProductRow } from '../quick-receipt/components/SelectedProductRow';
import { useContinuousPurchase } from '../hooks/use-continuous-purchase';
import { useStoreProduct } from '../common/hooks/use-store-product';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';
import { CONTINUOUS_FORM_ID } from './ContinuousPurchaseScreen.constants';

/**
 * Continuous single-product purchase (CPB-06 / US-F13-02, Figma 1255:79 desktop · 1255:159 mobile): identify a
 * product, enter this purchase, «ثبت خرید» records it as its own receipt and the same form is ready again. No
 * intermediate success page and no «ثبت خرید و پایان»; the previous receipt is one link away.
 */
export function ContinuousPurchaseScreen({ productId: preselected = null }: { productId?: string | null }) {
  const t = usePurchaseTranslations();
  const errorMessage = useAppErrorMessage();
  const store = useActiveStore();
  const nav = useNavigation();
  const online = useOnlineStatus();
  const flow = useContinuousPurchase();
  const { draft, command } = flow;
  const product = useStoreProduct(draft?.productId ?? null);
  const handle = useRef<ReceiptFormHandle | null>(null);
  const onReady = useCallback((h: ReceiptFormHandle) => (handle.current = h), []);
  const applied = useRef(false);
  const [closedFor, setClosedFor] = useState<AppError | null>(null);
  const clear = useConfirmAction(() => flow.clear());
  const { identify } = flow;
  // a product chosen elsewhere (product detail, a product just registered) is identified once
  useEffect(() => {
    if (!preselected || !draft || applied.current || draft.pending) return;
    applied.current = true;
    if (draft.productId !== preselected) void identify(preselected, null);
  }, [preselected, draft, identify]);

  if (flow.loading)
    return (
      <PurchasingShell title={t('continuous.title')}>
        <PageState kind="loading" rows={4} />
      </PurchasingShell>
    );
  if (!draft)
    return (
      <PurchasingShell title={t('continuous.title')}>
        <PageState kind="error" description={flow.error ? errorMessage(flow.error) : undefined} />
      </PurchasingShell>
    );
  const locked = !!draft.pending || command.busy;
  const duplicate = command.failed?.code === 'PURCHASE_DUPLICATE_INVOICE' ? command.failed : null;
  const onIdentify = (productId: string, unitId: string | null) => {
    if (productId === draft.productId && handle.current) {
      if (unitId) handle.current.setUnit(unitId);
    } else void flow.identify(productId, unitId);
  };
  const leave = async () => {
    await handle.current?.flush();
    nav.push(sellerRoutes.purchases.list(store.id));
  };
  return (
    <PurchasingShell
      title={t('continuous.title')}
      back={() => void leave()}
      actions={
        <>
          <Button
            type="submit"
            form={CONTINUOUS_FORM_ID}
            block
            loading={command.busy}
            disabled={!product.data || locked || !online}
          >
            {t('continuous.submit')}
          </Button>
          <Button variant="secondary" block onClick={() => void leave()}>
            {t('back')}
          </Button>
        </>
      }
    >
      <p className="text-body-m text-fg-secondary">{t('continuous.intro')}</p>
      {!online ? <Alert tone="warning" title={t('receipt.offline')} /> : null}
      <RecordedReceiptBanner receipt={draft.last} />
      <SalePriceOutcome state={flow.price.state} onRetry={() => void flow.price.retry()} />
      <ReceiptOutcome
        unknown={command.unknown}
        failed={duplicate && closedFor !== duplicate ? null : command.failed}
        draftError={command.draftError}
        followUpFailed={command.completionErrors.length > 0}
        busy={command.busy}
        onRecover={() => void command.recover()}
      />
      <ProductIdentification disabled={locked} onIdentify={onIdentify} />
      {product.data ? (
        <>
          <SelectedProductRow product={product.data} />
          <ReceiptForm
            kind="Purchase"
            key={product.data.id}
            id={CONTINUOUS_FORM_ID}
            product={product.data}
            initial={draft.form}
            disabled={locked}
            failed={command.failed}
            onReady={onReady}
            onSave={(values) => flow.saveForm(product.data!.id, values)}
            onSubmit={(values) => flow.submit(product.data!.id, product.data!.title, values)}
          />
          <Button variant="text" disabled={locked} onClick={() => clear.open()}>
            {t('continuous.clearForm')}
          </Button>
        </>
      ) : draft.productId && product.isPending ? (
        <PageState kind="loading" rows={3} />
      ) : product.error ? (
        <PageState kind="error" description={errorMessage(product.error)} />
      ) : (
        <p className="text-body-m text-fg-tertiary">{t('continuous.chooseFirst')}</p>
      )}
      <DuplicateInvoiceDialog
        open={!!duplicate && closedFor !== duplicate}
        message={duplicate?.message ?? ''}
        busy={command.busy}
        onOpenChange={(open) => !open && setClosedFor(duplicate)}
        onConfirm={(reason) => {
          setClosedFor(duplicate);
          if (product.data) void flow.confirmDuplicate(product.data.id, product.data.title, reason);
        }}
      />
      <ConfirmDialog
        {...clear.dialog}
        destructive
        title={t('continuous.clearTitle')}
        description={t('continuous.clearHint')}
        confirmLabel={t('continuous.clearConfirm')}
      />
    </PurchasingShell>
  );
}
