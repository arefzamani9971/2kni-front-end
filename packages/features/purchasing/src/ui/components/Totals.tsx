'use client';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { usePurchasePresentation } from '../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

import type { Dto } from '@dukani/contracts';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, Button, ConfirmDialog, PageState, SummaryCard, TextArea, useToast } from '@dukani/ui-kit';
import { useState } from 'react';
import { PurchasingShell } from '../common/components/PurchasingShell';
import { usePurchaseTotals } from '../hooks/use-purchase-totals';
import { useFinalizePurchase } from '../hooks/use-finalize-purchase';
import { useTotalsForm } from '../hooks/use-totals-form';
import { TotalsFields } from './TotalsFields';

export function Totals({ purchase: p }: { purchase: Dto<'PurchaseDto'> }) {
  const t = usePurchaseTranslations();
  const errorMessage = useAppErrorMessage();
  const presentation = usePurchasePresentation();

  const store = useActiveStore();
  const nav = useNavigation();
  const toast = useToast();
  const form = useTotalsForm(p);
  const [dup, setDup] = useState<{ open: boolean; reason: string }>({ open: false, reason: '' });
  const finalize = useFinalizePurchase(p, (dto) => {
    toast(
      t('receiptFinalized', { number: dto.number == null ? '' : presentation.qty(dto.number) }),
      'success',
    );
    nav.replace(sellerRoutes.purchases.detail(store.id, dto.id));
  });
  const totals = usePurchaseTotals(p.id, finalize.version);
  const submit = (confirm: boolean, reason: string | null) =>
    form.handleSubmit(({ discountAmount, shippingAmount, nonRecoverableTaxAmount }) =>
      finalize.submit({
        amounts: { discountAmount, shippingAmount, nonRecoverableTaxAmount },
        confirm,
        reason,
      }),
    )();

  const failed = finalize.state.kind === 'failed' ? finalize.state.error : null;
  const needsConfirm = failed?.code === 'PURCHASE_DUPLICATE_INVOICE';
  const computed = totals.data;
  return (
    <PurchasingShell
      title={t('purchaseTotals')}
      back={finalize.locked ? undefined : () => nav.push(sellerRoutes.purchases.lines(store.id, p.id))}
      actions={
        <form.Status>
          {(status) => (
            <Button
              block
              loading={finalize.busy}
              disabled={!status.isValid || finalize.locked}
              onClick={() => void submit(false, null)}
            >
              {t('finalizePurchase')}
            </Button>
          )}
        </form.Status>
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
      {finalize.saveError ? (
        <Alert title={t('saveFailed')} description={errorMessage(finalize.saveError)} />
      ) : null}
      <TotalsFields form={form} disabled={finalize.locked} computed={computed} />
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
      <form.Status>
        {(status) =>
          status.isDirty ? <p className="text-body-s text-fg-secondary">{t('allocateOnSubmit')}</p> : null
        }
      </form.Status>
      {computed?.warnings.map((w) => (
        <Alert key={w} tone="warning" title={w} />
      ))}
      <Button
        variant="secondary"
        block
        iconStart="upload"
        disabled={finalize.locked}
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
