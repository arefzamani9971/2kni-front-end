'use client';
import type { Dto } from '@dukani/contracts';
import { useFinalCommand } from '@dukani/data';
import { formatMoney, parseMoneyInput, toApiMoney, toPersianDigits } from '@dukani/domain';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, Button, ConfirmDialog, MoneyField, PageState, Section, SummaryCard, TextArea, useToast } from '@dukani/ui-kit';
import { useEffect, useState } from 'react';
import { invoiceDifference, toman, toUpdateBody } from '../../domain/purchase';
import { usePurchasingModule } from '../../module';
import { PurchasingShell } from '../components/PurchasingShell';
import { purchaseKeys } from '../hooks/purchase-keys';
import { usePurchase } from '../hooks/use-purchase';
import { usePurchaseTotals } from '../hooks/use-purchase-totals';
import { useSaveDraft } from '../hooks/use-save-draft';

const toRials = (raw: string): number => {
  const r = parseMoneyInput(raw || '0');
  return r.ok ? toApiMoney(r.value) : NaN;
};

/** purchasetotals (Figma 358:547): discount, extra costs, supplier invoice check → «ثبت نهایی خرید» (F71). */
export function PurchaseTotalsScreen({ purchaseId }: { purchaseId: string }) {
  const purchase = usePurchase(purchaseId);
  const nav = useNavigation();
  const store = useActiveStore();
  const p = purchase.data;
  const finalized = p && p.status !== 'Draft';
  useEffect(() => {
    if (finalized) nav.replace(sellerRoutes.purchases.detail(store.id, purchaseId));
  }, [finalized, nav, store.id, purchaseId]);
  if (!p || finalized)
    return (
      <PurchasingShell title="جمع رسید خرید" back={() => nav.back()}>
        {purchase.error ? <PageState kind="error" description={purchase.error.message} /> : <PageState kind="loading" rows={3} />}
      </PurchasingShell>
    );
  return <Totals key={p.id} purchase={p} />;
}

function Totals({ purchase: p }: { purchase: Dto<'PurchaseDto'> }) {
  const store = useActiveStore();
  const nav = useNavigation();
  const toast = useToast();
  const { purchases } = usePurchasingModule();
  const save = useSaveDraft(p.id);
  const totals = usePurchaseTotals(p.id, p.version);
  const [discount, setDiscount] = useState(p.discountRials ? String(p.discountRials) : '');
  const [shipping, setShipping] = useState(p.shippingRials ? String(p.shippingRials) : '');
  const [tax, setTax] = useState(p.nonRecoverableTaxRials ? String(p.nonRecoverableTaxRials) : '');
  const [invoiceTotal, setInvoiceTotal] = useState('');
  const [dup, setDup] = useState<{ open: boolean; reason: string }>({ open: false, reason: '' });

  const finalize = useFinalCommand<{ version: number; confirm: boolean; reason: string | null }, Dto<'PurchaseDto'>>({
    run: (v, operationId) =>
      purchases.finalize(store.id, p.id, { expectedVersion: v.version, confirmDuplicateInvoiceNo: v.confirm, duplicateReason: v.reason }, operationId),
    invalidates: [purchaseKeys(store.id).all, ['products', store.id], ['reports', store.id]],
    onSuccess: (dto) => {
      toast(`رسید ${dto.number != null ? toPersianDigits(String(dto.number)) : ''} ثبت شد و موجودی اضافه شد.`, 'success');
      nav.replace(sellerRoutes.purchases.detail(store.id, dto.id));
    },
  });

  const amounts = { discountRials: toRials(discount), shippingRials: toRials(shipping), nonRecoverableTaxRials: toRials(tax) };
  const dirty =
    amounts.discountRials !== p.discountRials || amounts.shippingRials !== p.shippingRials || amounts.nonRecoverableTaxRials !== p.nonRecoverableTaxRials;
  const invalid = Object.values(amounts).some(Number.isNaN);

  /** Saves the amounts (new version) and finalizes with that version. */
  const submit = async (confirm: boolean, reason: string | null) => {
    let version = p.version;
    if (dirty) version = (await save.mutateAsync(toUpdateBody(p, amounts))).version;
    await finalize.submit({ version, confirm, reason });
  };

  const failed = finalize.state.kind === 'failed' ? finalize.state.error : null;
  const needsConfirm = failed?.code === 'PURCHASE_DUPLICATE_INVOICE';
  const t = totals.data;
  const parsedInvoice = invoiceTotal ? parseMoneyInput(invoiceTotal) : null;
  const diff = t && parsedInvoice?.ok ? invoiceDifference(t.totalRials, parsedInvoice.value) : null;

  return (
    <PurchasingShell
      title="جمع رسید خرید"
      back={() => nav.push(sellerRoutes.purchases.lines(store.id, p.id))}
      actions={
        <Button block loading={finalize.busy || save.isPending} disabled={invalid} onClick={() => void submit(false, null)}>
          ثبت نهایی خرید
        </Button>
      }
    >
      {finalize.state.kind === 'unknown' ? (
        <PageState
          kind="unknown-result"
          action={
            <Button variant="secondary" onClick={() => void finalize.retry()}>
              بررسی دوباره
            </Button>
          }
        />
      ) : null}
      {failed && !needsConfirm ? <Alert title="ثبت نهایی انجام نشد" description={failed.message} /> : null}
      {needsConfirm ? (
        <Alert
          tone="warning"
          title="شمارهٔ فاکتور تکراری است"
          description={failed.message}
          action={
            <Button size="sm" variant="secondary" onClick={() => setDup({ open: true, reason: '' })}>
              فاکتور دیگری است؛ ثبت شود
            </Button>
          }
        />
      ) : null}
      {save.error ? <Alert title="ذخیره نشد" description={save.error.message} /> : null}
      <Section>
        <MoneyField label="تخفیف کل" optional value={discount} onChange={setDiscount} />
        <MoneyField label="حمل قابل تخصیص به کالا" optional value={shipping} onChange={setShipping} />
        <MoneyField label="مالیات غیرقابل بازیافت" optional value={tax} onChange={setTax} />
        <MoneyField label="جمع فاکتور تأمین‌کننده" optional value={invoiceTotal} onChange={setInvoiceTotal} hint="برای کنترل؛ ذخیره نمی‌شود." />
        {t ? (
          <p className="text-body-m text-fg-secondary">
            جمع محاسبه‌شده: {toman(t.totalRials)}
            {diff ? ` · اختلاف: ${diff.matches ? 'صفر' : formatMoney(diff.diff)}` : ''}
          </p>
        ) : null}
      </Section>
      {t ? (
        <SummaryCard
          lines={[
            { label: 'جمع اقلام', value: toman(t.subtotalRials) },
            { label: 'تخفیف', value: toman(t.discountRials), tone: 'danger' },
            { label: 'هزینه‌های اضافه', value: toman(t.extraCostsRials) },
            { label: 'مبلغ رسید', value: toman(t.totalRials), total: true },
          ]}
        />
      ) : null}
      {dirty ? <p className="text-body-s text-fg-secondary">مبالغ تازه هنگام ثبت ذخیره و بین اقلام پخش می‌شوند.</p> : null}
      {t?.warnings.map((w) => <Alert key={w} tone="warning" title={w} />)}
      <Button variant="secondary" block iconStart="upload" onClick={() => nav.push(sellerRoutes.purchases.attachment(store.id, p.id))}>
        {p.attachmentFileIds.length ? `پیوست‌ها (${toPersianDigits(String(p.attachmentFileIds.length))})` : 'افزودن عکس یا PDF فاکتور'}
      </Button>
      <ConfirmDialog
        open={dup.open}
        onOpenChange={(open) => setDup((d) => ({ ...d, open }))}
        title="ثبت با شمارهٔ فاکتور تکراری"
        description="اگر این فاکتور دیگری با همان شماره است، دلیل را بنویسید."
        confirmLabel="ثبت نهایی"
        loading={finalize.busy}
        onConfirm={() => {
          if (!dup.reason.trim()) return;
          setDup((d) => ({ ...d, open: false }));
          finalize.reset();
          void submit(true, dup.reason.trim());
        }}
      >
        <TextArea label="دلیل" required value={dup.reason} onChange={(reason) => setDup((d) => ({ ...d, reason }))} placeholder="مثلاً فاکتور دوم همان روز" />
      </ConfirmDialog>
    </PurchasingShell>
  );
}
