'use client';
import { decimal, formatDecimalFa, formatJalali, toPersianDigits } from '@dukani/domain';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, ButtonLink, ListRow, PageState, ProductDataRow, Section, SummaryCard } from '@dukani/ui-kit';
import { useEffect } from 'react';
import { lineRow, toman } from '../../domain/purchase';
import { STATUS_LABELS } from '../../domain/purchase.constants';
import { PurchasingShell } from '../components/PurchasingShell';
import { usePurchase } from '../hooks/use-purchase';

/** purchasedetail (Figma 358:549): finalized receipt with lines, landed costs and attachments. */
export function PurchaseDetailScreen({ purchaseId }: { purchaseId: string }) {
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
            ? `رسید خرید شماره ${formatDecimalFa(decimal.of(p.number))}`
            : 'رسید خرید'
          : 'رسید خرید'
      }
      back={() => nav.push(sellerRoutes.purchases.list(store.id))}
      actions={
        <Button block onClick={() => nav.push(sellerRoutes.purchases.new(store.id))}>
          ثبت خرید بعدی
        </Button>
      }
    >
      {purchase.isPending ? <PageState kind="loading" rows={3} /> : null}
      {purchase.error ? (
        <PageState
          kind={purchase.error.kind === 'NotFound' ? 'not-found' : 'error'}
          description={purchase.error.message}
        />
      ) : null}
      {p ? (
        <>
          <ProductDataRow
            title={[
              p.supplier?.name ?? (p.kind === 'Opening' ? 'موجودی اول دوره' : 'بدون تأمین‌کننده'),
              p.supplierInvoiceNo ? `فاکتور ${toPersianDigits(p.supplierInvoiceNo)}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
            subtitle={`${formatDecimalFa(decimal.of(p.lines.length))} قلم · ${formatDecimalFa(qtyBase)} واحد`}
            meta={toman(p.totalAmount)}
            metaTone="warning"
          />
          <p className="text-body-m text-fg-secondary">
            وضعیت: {STATUS_LABELS[p.status]} ·{' '}
            {formatJalali(new Date(p.finalizedAt ?? p.purchasedAt), 'd MMMM yyyy')}
            {p.attachmentFileIds.length
              ? ` · ${formatDecimalFa(decimal.of(p.attachmentFileIds.length))} پیوست`
              : ''}
          </p>
          <Section title="اقلام">
            {p.lines.map((l) => (
              <ListRow key={l.id}>
                {l.title} · {lineRow(l)}
                {l.costPerBaseAmount != null ? ` · بهای تمام‌شدهٔ هر واحد ${toman(l.costPerBaseAmount)}` : ''}
              </ListRow>
            ))}
          </Section>
          <SummaryCard
            lines={[
              { label: 'جمع اقلام', value: toman(p.subtotalAmount) },
              { label: 'تخفیف', value: toman(p.discountAmount), tone: 'danger' },
              {
                label: 'حمل و مالیات',
                value: toman(
                  decimal.add(decimal.of(p.shippingAmount), decimal.of(p.nonRecoverableTaxAmount)),
                ),
              },
              { label: 'مبلغ رسید', value: toman(p.totalAmount), total: true },
            ]}
          />
          {p.lines[0] ? (
            <ButtonLink href={sellerRoutes.products.detail(store.id, p.lines[0].storeProductId)}>
              مشاهده گردش موجودی
            </ButtonLink>
          ) : null}
          <ButtonLink href={sellerRoutes.purchases.attachment(store.id, p.id)}>
            {p.attachmentFileIds.length ? 'افزودن پیوست دیگر' : 'افزودن عکس یا PDF فاکتور'}
          </ButtonLink>
          <ButtonLink href={`${sellerRoutes.purchases.detail(store.id, p.id)}/correction`}>
            اصلاح اشتباه ثبت
          </ButtonLink>
        </>
      ) : null}
    </PurchasingShell>
  );
}
