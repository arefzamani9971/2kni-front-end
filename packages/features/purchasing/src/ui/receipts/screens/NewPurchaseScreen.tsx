'use client';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { usePurchasePresentation } from '../../common/hooks/use-purchase-presentation';
import { usePurchaseTranslations } from '../../i18n/use-purchase-translations';

import { type AppError, isAppError, todayDateOnly, type DateOnly } from '@dukani/domain';
import { useInvalidate } from '@dukani/data';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, Button, DateField, PageState, ProductDataRow, Section, TextField } from '@dukani/ui-kit';
import { useRef, useState } from 'react';
import { dateOnlyToInstant, toLineInput } from '../../../domain/purchase';
import type { LineDraft } from '../../../domain/purchase.types';
import { usePurchasingModule } from '../../../module';
import { LineEditor } from '../components/LineEditor';
import { ProductPicker } from '../components/ProductPicker';
import { PurchasingShell } from '../../common/components/PurchasingShell';
import { SupplierField } from '../../common/components/SupplierField';
import { purchaseKeys } from '../../common/state/purchase-keys';
import { useStoreProduct } from '../../common/hooks/use-store-product';

/**
 * purchase (Figma 312:9194): first line + receipt header. «افزودن به رسید» creates the server draft
 * (`POST …/purchases`), so the receipt continues on any device (`~/purchases/[id]/lines`).
 */
export function NewPurchaseScreen({ productId: initialProduct = null }: { productId?: string | null }) {
  const t = usePurchaseTranslations();
  const errorMessage = useAppErrorMessage();
  const presentation = usePurchasePresentation();

  const store = useActiveStore();
  const nav = useNavigation();
  const { purchases } = usePurchasingModule();
  const invalidate = useInvalidate();
  const [productId, setProductId] = useState<string | null>(initialProduct);
  const [picking, setPicking] = useState(!initialProduct);
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState<DateOnly | ''>(todayDateOnly());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | 'unexpected' | null>(null);
  const submitting = useRef(false);
  const product = useStoreProduct(productId);

  const create = async (line?: LineDraft) => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      const draft = await purchases.createDraft(store.id, {
        kind: 'Purchase',
        supplierId: supplierId || null,
        supplierInvoiceNo: invoiceNo.trim() || null,
        purchasedAt: dateOnlyToInstant(date || todayDateOnly()),
        lines: line ? [toLineInput(line)] : [],
      });
      await invalidate(purchaseKeys(store.id).all);
      nav.replace(
        line ? sellerRoutes.purchases.lines(store.id, draft.id) : sellerRoutes.entry.new(store.id, draft.id),
      );
    } catch (e) {
      setError(isAppError(e) ? e : 'unexpected');
      if (!line) setPicking(false);
      setBusy(false);
      submitting.current = false;
    }
  };

  return (
    <PurchasingShell
      title={t('newPurchase')}
      actions={
        <Button variant="secondary" block onClick={() => nav.push(sellerRoutes.purchases.list(store.id))}>
          {t('back')}
        </Button>
      }
    >
      {error ? (
        <Alert
          title={t('createReceiptFailed')}
          description={error === 'unexpected' ? t('createReceiptError') : errorMessage(error)}
        />
      ) : null}
      <Section title={t('product')}>
        {product.data ? (
          <ProductDataRow
            title={product.data.title}
            subtitle={t('productStock', {
              type: product.data.productTypeName,
              quantity: presentation.qty(product.data.available),
              unit: product.data.baseUnitName,
            })}
            onClick={() => setPicking(true)}
            trailing={<span className="text-label-m text-fg-brand">{t('change')}</span>}
          />
        ) : productId ? (
          <PageState kind="loading" rows={1} />
        ) : (
          <Button variant="secondary" block iconStart="search" onClick={() => setPicking(true)}>
            {t('chooseProduct')}
          </Button>
        )}
      </Section>
      {product.data ? (
        <LineEditor
          key={product.data.id}
          product={product.data}
          submitLabel={t('addToReceipt')}
          busy={busy}
          onSubmit={create}
          extra={
            <Section title={t('purchaseInvoice')}>
              <SupplierField value={supplierId} onChange={setSupplierId} />
              <TextField
                label={t('supplierInvoiceNumber')}
                optional
                value={invoiceNo}
                onChange={setInvoiceNo}
                maxLength={40}
                dir="auto"
              />
              <DateField
                label={t('purchaseDate')}
                required
                value={date}
                onChange={setDate}
                max={todayDateOnly()}
              />
            </Section>
          }
        />
      ) : null}
      <ProductPicker
        open={picking}
        onOpenChange={setPicking}
        onPick={setProductId}
        busy={busy}
        onCreate={!productId ? () => void create() : undefined}
      />
    </PurchasingShell>
  );
}
