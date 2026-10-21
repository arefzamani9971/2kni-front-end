'use client';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { usePurchasePresentation } from '../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

import {
  Alert,
  Button,
  ConfirmDialog,
  IconButton,
  ListRow,
  PageState,
  ProductDataRow,
  Section,
} from '@dukani/ui-kit';

import { ProductPicker } from '../receipts/components/ProductPicker';
import { PurchasingShell } from '../common/components/PurchasingShell';

import { usePurchaseLines } from '../hooks/use-purchase-lines';
import { LineSheet } from '../receipts/components/LineSheet';

/** Receipt lines of a draft: add, change and remove products before the totals step. */
export function PurchaseLinesScreen({ purchaseId, productId }: { purchaseId: string; productId?: string }) {
  const t = usePurchaseTranslations();
  const errorMessage = useAppErrorMessage();
  const presentation = usePurchasePresentation();

  const {
    purchase,
    picking,
    setPicking,
    editing,
    setEditing,
    closeLine,
    discarding,
    setDiscarding,
    busy,
    discardingBusy,
    saveError,
    removeLine,
    saveLine,
    discardDraft,
    back,
    totals,
  } = usePurchaseLines(purchaseId, productId);
  const p = purchase.data;
  const title = p
    ? [
        p.supplier?.name,
        p.supplierInvoiceNo ? t('invoiceNumber', { number: presentation.digits(p.supplierInvoiceNo) }) : null,
        presentation.date(p.purchasedAt),
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <PurchasingShell
      title={t('receiptItems')}
      back={back}
      actions={
        p ? (
          <>
            <Button block disabled={p.lines.length === 0} onClick={totals}>
              {t('reviewTotals')}
            </Button>
            <Button variant="secondary" block onClick={back}>
              {t('saveDraftExit')}
            </Button>
          </>
        ) : undefined
      }
    >
      {purchase.isPending ? <PageState kind="loading" rows={3} /> : null}
      {purchase.error ? (
        <PageState
          kind={purchase.error.kind === 'NotFound' ? 'not-found' : 'error'}
          description={errorMessage(purchase.error)}
        />
      ) : null}
      {saveError ? <Alert title={t('saveFailed')} description={errorMessage(saveError)} /> : null}
      {p ? (
        <>
          <Section title={t('draftReceipt')}>
            <ListRow>{title || t('noSupplier')}</ListRow>
            <ListRow>
              {t('currentTotal')}
              {presentation.toman(p.totalAmount)}
            </ListRow>
          </Section>
          <Section title={t('itemsCount', { count: p.lines.length })}>
            {p.lines.map((l, i) => (
              <ProductDataRow
                key={l.id}
                title={l.title}
                meta={presentation.lineRow(l)}
                metaTone={l.costStatus === 'Unknown' ? 'warning' : 'neutral'}
                trailing={
                  <span className="flex items-center">
                    <IconButton
                      icon="edit"
                      label={t('editNamed', { name: l.title })}
                      onClick={() => setEditing({ productId: l.storeProductId, index: i })}
                    />
                    <IconButton
                      icon="trash"
                      label={t('removeNamed', { name: l.title })}
                      tone="danger"
                      onClick={() => void removeLine(i)}
                      disabled={busy}
                    />
                  </span>
                }
              />
            ))}
            <Button variant="secondary" block iconStart="plus" onClick={() => setPicking(true)}>
              {t('addAnotherProduct')}
            </Button>
          </Section>
          <Button variant="text" block className="text-danger" onClick={() => setDiscarding(true)}>
            {t('discardDraft')}
          </Button>
          <ProductPicker
            purchaseId={purchaseId}
            open={picking}
            onOpenChange={setPicking}
            onPick={(id) => setEditing({ productId: id, index: null })}
          />
          <LineSheet editing={editing} purchase={p} onClose={closeLine} onSave={saveLine} busy={busy} />
          <ConfirmDialog
            open={discarding}
            onOpenChange={setDiscarding}
            title={t('discardTitle')}
            description={t('discardHint')}
            confirmLabel={t('discard')}
            destructive
            onConfirm={discardDraft}
            loading={discardingBusy}
          />
        </>
      ) : null}
    </PurchasingShell>
  );
}
