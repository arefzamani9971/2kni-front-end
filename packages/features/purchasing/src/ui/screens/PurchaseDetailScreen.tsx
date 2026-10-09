'use client';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { usePurchasePresentation } from '../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

import { decimal } from '@dukani/domain';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, ButtonLink, ListRow, PageState, ProductDataRow, Section, SummaryCard } from '@dukani/ui-kit';
import { useEffect } from 'react';
import { PurchasingShell } from '../components/PurchasingShell';
import { usePurchase } from '../hooks/use-purchase';

/** purchasedetail (Figma 358:549): finalized receipt with lines, landed costs and attachments. */
export function PurchaseDetailScreen({ purchaseId }: { purchaseId: string }) {
  const t = usePurchaseTranslations();
  const errorMessage = useAppErrorMessage();
  const presentation = usePurchasePresentation();

  const store = useActiveStore();
  const nav = useNavigation();
  const purchase = usePurchase(purchaseId);
  const p = purchase.data;
  useEffect(() => {
    if (p?.status === 'Draft') nav.replace(sellerRoutes.purchases.lines(store.id, p.id));
  }, [p, nav, store.id]);

  const qtyBase = p ? decimal.sum(p.lines.map((l) => decimal.of(l.qtyBase))) : decimal.zero;
  return (
    <PurchasingShell
      title={
        p
          ? p.number != null
            ? t('receiptNumber', { number: presentation.qty(p.number) })
            : t('purchaseReceipt')
          : t('purchaseReceipt')
      }
      back={() => nav.push(sellerRoutes.purchases.list(store.id))}
      actions={
        <Button block onClick={() => nav.push(sellerRoutes.purchases.new(store.id))}>
          {t('nextPurchase')}
        </Button>
      }
    >
      {purchase.isPending ? <PageState kind="loading" rows={3} /> : null}
      {purchase.error ? (
        <PageState
          kind={purchase.error.kind === 'NotFound' ? 'not-found' : 'error'}
          description={errorMessage(purchase.error)}
        />
      ) : null}
      {p ? (
        <>
          <ProductDataRow
            title={[
              p.supplier?.name ?? (p.kind === 'Opening' ? t('openingStock') : t('noSupplier')),
              p.supplierInvoiceNo
                ? t('invoiceNumber', { number: presentation.digits(p.supplierInvoiceNo) })
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
            subtitle={t('itemsUnits', { items: p.lines.length, quantity: presentation.qty(qtyBase) })}
            meta={presentation.toman(p.totalAmount)}
            metaTone="warning"
          />
          <p className="text-body-m text-fg-secondary">
            {t('status')}
            {t(`statuses.${p.status}`)} · {presentation.date(p.finalizedAt ?? p.purchasedAt)}
            {p.attachmentFileIds.length ? t('attachmentCount', { count: p.attachmentFileIds.length }) : ''}
          </p>
          <Section title={t('items')}>
            {p.lines.map((l) => (
              <ListRow key={l.id}>
                {l.title} · {presentation.lineRow(l)}
                {l.costPerBaseAmount != null
                  ? t('landedCost', { price: presentation.toman(l.costPerBaseAmount) })
                  : ''}
              </ListRow>
            ))}
          </Section>
          <SummaryCard
            lines={[
              { label: t('itemsTotal'), value: presentation.toman(p.subtotalAmount) },
              { label: t('discount'), value: presentation.toman(p.discountAmount), tone: 'danger' },
              {
                label: t('shippingTax'),
                value: presentation.toman(
                  decimal.add(decimal.of(p.shippingAmount), decimal.of(p.nonRecoverableTaxAmount)),
                ),
              },
              { label: t('receiptAmount'), value: presentation.toman(p.totalAmount), total: true },
            ]}
          />
          {p.lines[0] ? (
            <ButtonLink href={sellerRoutes.products.detail(store.id, p.lines[0].storeProductId)}>
              {t('stockMovements')}
            </ButtonLink>
          ) : null}
          <ButtonLink href={sellerRoutes.purchases.attachment(store.id, p.id)}>
            {p.attachmentFileIds.length ? t('anotherAttachment') : t('addInvoiceAttachment')}
          </ButtonLink>
          <ButtonLink href={`${sellerRoutes.purchases.detail(store.id, p.id)}/correction`}>
            {t('correctMistake')}
          </ButtonLink>
        </>
      ) : null}
    </PurchasingShell>
  );
}
