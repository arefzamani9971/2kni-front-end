'use client';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { usePurchasePresentation } from '../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

import type { Dto } from '@dukani/contracts';
import { useFinalCommand } from '@dukani/data';
import { decimal, parseMoneyInput } from '@dukani/domain';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import {
  Alert,
  Button,
  ConfirmDialog,
  MoneyField,
  PageState,
  Section,
  SummaryCard,
  TextArea,
  useToast,
} from '@dukani/ui-kit';
import { useState } from 'react';
import { initial, invoiceDifference, toAmount, toUpdateBody } from '../../domain/purchase';
import { usePurchasingModule } from '../../module';
import { PurchasingShell } from './PurchasingShell';
import { purchaseKeys } from '../hooks/purchase-keys';
import { usePurchaseTotals } from '../hooks/use-purchase-totals';
import { useSaveDraft } from '../hooks/use-save-draft';

export function Totals({ purchase: p }: { purchase: Dto<'PurchaseDto'> }) {
  const t = usePurchaseTranslations();
  const errorMessage = useAppErrorMessage();
  const presentation = usePurchasePresentation();

  const store = useActiveStore();
  const nav = useNavigation();
  const toast = useToast();
  const { purchases } = usePurchasingModule();
  const save = useSaveDraft(p.id);
  const totals = usePurchaseTotals(p.id, p.version);
  const [discount, setDiscount] = useState(initial(p.discountAmount));
  const [shipping, setShipping] = useState(initial(p.shippingAmount));
  const [tax, setTax] = useState(initial(p.nonRecoverableTaxAmount));
  const [invoiceTotal, setInvoiceTotal] = useState('');
  const [dup, setDup] = useState<{ open: boolean; reason: string }>({ open: false, reason: '' });

  const finalize = useFinalCommand<
    { version: number; confirm: boolean; reason: string | null },
    Dto<'PurchaseDto'>
  >({
    run: (v, operationId) =>
      purchases.finalize(
        store.id,
        p.id,
        { expectedVersion: v.version, confirmDuplicateInvoiceNo: v.confirm, duplicateReason: v.reason },
        operationId,
      ),
    invalidates: [purchaseKeys(store.id).all, ['products', store.id], ['reports', store.id]],
    onSuccess: (dto) => {
      toast(
        t('receiptFinalized', { number: dto.number == null ? '' : presentation.qty(dto.number) }),
        'success',
      );
      nav.replace(sellerRoutes.purchases.detail(store.id, dto.id));
    },
  });

  const parsed = {
    discountAmount: toAmount(discount),
    shippingAmount: toAmount(shipping),
    nonRecoverableTaxAmount: toAmount(tax),
  };
  const invalid = Object.values(parsed).some((v) => v === null);
  const amounts = {
    discountAmount: parsed.discountAmount ?? decimal.zero,
    shippingAmount: parsed.shippingAmount ?? decimal.zero,
    nonRecoverableTaxAmount: parsed.nonRecoverableTaxAmount ?? decimal.zero,
  };
  const same = (a: string, b: string) => decimal.eq(decimal.of(a), decimal.of(b));
  const dirty =
    !same(amounts.discountAmount, p.discountAmount) ||
    !same(amounts.shippingAmount, p.shippingAmount) ||
    !same(amounts.nonRecoverableTaxAmount, p.nonRecoverableTaxAmount);

  /** Saves the amounts (new version) and finalizes with that version. */
  const submit = async (confirm: boolean, reason: string | null) => {
    let version = p.version;
    if (dirty) version = (await save.mutateAsync(toUpdateBody(p, amounts))).version;
    await finalize.submit({ version, confirm, reason });
  };

  const failed = finalize.state.kind === 'failed' ? finalize.state.error : null;
  const needsConfirm = failed?.code === 'PURCHASE_DUPLICATE_INVOICE';
  const computed = totals.data;
  const parsedInvoice = invoiceTotal ? parseMoneyInput(invoiceTotal) : null;
  const diff =
    computed && parsedInvoice?.ok ? invoiceDifference(computed.totalAmount, parsedInvoice.value) : null;

  return (
    <PurchasingShell
      title={t('purchaseTotals')}
      back={() => nav.push(sellerRoutes.purchases.lines(store.id, p.id))}
      actions={
        <Button
          block
          loading={finalize.busy || save.isPending}
          disabled={invalid || finalize.state.kind === 'succeeded'}
          onClick={() => void submit(false, null)}
        >
          {t('finalizePurchase')}
        </Button>
      }
    >
      {finalize.state.kind === 'unknown' ? (
        <PageState
          kind="unknown-result"
          action={
            <Button variant="secondary" onClick={() => void finalize.retry()}>
              {t('checkAgain')}
            </Button>
          }
        />
      ) : null}
      {failed && !needsConfirm ? (
        <Alert title={t('finalizeFailed')} description={errorMessage(failed)} />
      ) : null}
      {finalize.completionErrors.length ? (
        <Alert tone="warning" title={t('purchaseRecorded')} description={t('resultIncomplete')} />
      ) : null}
      {needsConfirm ? (
        <Alert
          tone="warning"
          title={t('duplicateInvoice')}
          description={errorMessage(failed)}
          action={
            <Button size="sm" variant="secondary" onClick={() => setDup({ open: true, reason: '' })}>
              {t('confirmDifferentInvoice')}
            </Button>
          }
        />
      ) : null}
      {save.error ? <Alert title={t('saveFailed')} description={errorMessage(save.error)} /> : null}
      <Section>
        <MoneyField label={t('totalDiscount')} optional value={discount} onChange={setDiscount} />
        <MoneyField label={t('allocatedShipping')} optional value={shipping} onChange={setShipping} />
        <MoneyField label={t('nonRecoverableTax')} optional value={tax} onChange={setTax} />
        <MoneyField
          label={t('supplierInvoiceTotal')}
          optional
          value={invoiceTotal}
          onChange={setInvoiceTotal}
          hint={t('checkOnly')}
        />
        {computed ? (
          <p className="text-body-m text-fg-secondary">
            {t('calculatedTotal')}
            {presentation.toman(computed.totalAmount)}
            {diff
              ? t('difference', { amount: diff.matches ? t('zero') : presentation.money(diff.diff) })
              : ''}
          </p>
        ) : null}
      </Section>
      {computed ? (
        <SummaryCard
          lines={[
            { label: t('itemsTotal'), value: presentation.toman(computed.subtotalAmount) },
            { label: t('discount'), value: presentation.toman(computed.discountAmount), tone: 'danger' },
            { label: t('extraCosts'), value: presentation.toman(computed.extraCostsAmount) },
            { label: t('receiptAmount'), value: presentation.toman(computed.totalAmount), total: true },
          ]}
        />
      ) : null}
      {dirty ? <p className="text-body-s text-fg-secondary">{t('allocateOnSubmit')}</p> : null}
      {computed?.warnings.map((w) => (
        <Alert key={w} tone="warning" title={w} />
      ))}
      <Button
        variant="secondary"
        block
        iconStart="upload"
        onClick={() => nav.push(sellerRoutes.purchases.attachment(store.id, p.id))}
      >
        {p.attachmentFileIds.length
          ? t('attachmentsTitle', { count: p.attachmentFileIds.length })
          : t('addInvoiceAttachment')}
      </Button>
      <ConfirmDialog
        open={dup.open}
        onOpenChange={(open) => setDup((d) => ({ ...d, open }))}
        title={t('submitDuplicate')}
        description={t('duplicateReasonHint')}
        confirmLabel={t('finalize')}
        loading={finalize.busy}
        onConfirm={() => {
          if (!dup.reason.trim()) return;
          setDup((d) => ({ ...d, open: false }));
          finalize.reset();
          void submit(true, dup.reason.trim());
        }}
      >
        <TextArea
          label={t('reason')}
          required
          value={dup.reason}
          onChange={(reason) => setDup((d) => ({ ...d, reason }))}
          placeholder={t('reasonPlaceholder')}
        />
      </ConfirmDialog>
    </PurchasingShell>
  );
}
