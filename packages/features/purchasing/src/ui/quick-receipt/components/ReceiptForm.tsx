'use client';
import { useFormAutosave, useLocalizedAppForm as useAppForm, useValidationRules } from '@dukani/forms';
import { Alert, TwoColumnWorkspace } from '@dukani/ui-kit';
import { useEffect, useLayoutEffect, useState } from 'react';
import { initialReceiptUnit } from '../../../domain/receipt-form';
import type { ReceiptFormOutput, ReceiptFormValues } from '../../../domain/receipt-form.types';
import { usePurchaseTranslations } from '../../i18n/use-purchase-translations';
import type { ReceiptFormProps } from '../types/ReceiptForm.types';
import { ReceiptHeaderFields } from './ReceiptHeaderFields';
import { receiptSchemaFor } from '../schemas/ReceiptForm.schema';
import { ReceiptLineFields } from './ReceiptLineFields';
import { ReceiptSummary } from './ReceiptSummary';
import { SalePriceField } from './SalePriceField';

/**
 * The form of one single-product receipt: a continuous-purchase turn (CPB-06, Figma 1255:79 / 1255:159) with this
 * purchase's date, supplier, charges and optional sale price beside the line on desktop and below it on mobile, or
 * an opening item (CPB-04, 1255:62 / 1255:142) without any purchase field. Typed input is autosaved into the draft;
 * while the receipt is frozen nothing is written or editable.
 */
export function ReceiptForm({
  id,
  kind,
  product,
  initial,
  disabled,
  failed,
  onSave,
  onSubmit,
  onReady,
}: ReceiptFormProps) {
  const t = usePurchaseTranslations();
  const [unit] = useState(() =>
    initialReceiptUnit(
      initial.unitId,
      product.units.filter((u) => u.isPurchasable && !u.archivedAt),
    ),
  );
  const form = useAppForm({
    schema: receiptSchemaFor(kind, product.baseUnitMaxDecimals, t, useValidationRules()),
    defaultValues: { ...initial, unitId: unit.unitId },
  });
  const autosave = useFormAutosave(form, {
    select: (values) => values as ReceiptFormValues,
    save: async (values) => !!(await onSave(values)),
    enabled: !disabled,
  });
  useLayoutEffect(() => {
    onReady({ flush: autosave.flush, setUnit: (unitId) => form.setValue('unitId', unitId) });
  }, [onReady, autosave, form]);
  useEffect(() => {
    if (failed) form.applyServerError(failed);
  }, [failed, form]);
  const submit = form.handleSubmit(async (values) => {
    await autosave.flush();
    await onSubmit(values as ReceiptFormOutput);
  });
  const line = (
    <>
      {unit.stale ? <Alert tone="warning" title={t('receipt.scanUnitUnavailable')} /> : null}
      <ReceiptLineFields form={form} product={product} kind={kind} disabled={disabled} />
      <ReceiptSummary form={form} product={product} />
    </>
  );
  return (
    <form id={id} noValidate onSubmit={submit} className="flex flex-col gap-4">
      {kind === 'Purchase' ? (
        <TwoColumnWorkspace
          secondaryOnMobile
          primary={line}
          secondary={
            <>
              <ReceiptHeaderFields form={form} disabled={disabled} />
              <SalePriceField form={form} product={product} disabled={disabled} />
            </>
          }
        />
      ) : (
        <>
          {line}
          <SalePriceField form={form} product={product} disabled={disabled} />
        </>
      )}
    </form>
  );
}
